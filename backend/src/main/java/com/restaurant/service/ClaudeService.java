package com.restaurant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.model.MenuItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClaudeService {
  private final RestClient restClient;
  private final ObjectMapper objectMapper;
  private final String apiKey;
  private final String model;

  public ClaudeService(
      ObjectMapper objectMapper,
      @Value("${groq.api.key}") String apiKey,
      @Value("${groq.model}") String model
  ) {
    this.objectMapper = objectMapper;
    this.apiKey = apiKey;
    this.model = model;
    this.restClient = RestClient.builder()
        .baseUrl("https://api.groq.com/openai")
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
  }

  public String chat(String customerName, String userMessage, List<MenuItem> menuItems) {
    try {
      if (apiKey == null || apiKey.isBlank() || "YOUR_API_KEY_HERE".equals(apiKey)) {
        return fallbackChat(customerName, userMessage, menuItems);
      }
      String menuJson = objectMapper.writeValueAsString(menuItems);

      String systemPrompt = """
          You are a helpful food ordering assistant for this restaurant.
          Here is the current menu (JSON): %s
          
          Help the customer find dishes based on their preferences.
          If the customer confirms an order, respond with a JSON block in this format:
          ORDER_CONFIRMED: { "items": [...], "totalAmount": ... }
          
          Always be friendly, suggest combos, and mention prices in ₹.
          """.formatted(menuJson);

      Map<String, Object> body = Map.of(
          "model", model,
          "max_tokens", 700,
          "temperature", 0.7,
          "messages", List.of(
              Map.of("role", "system", "content", systemPrompt),
              Map.of("role", "user", "content", "Customer: " + customerName + "\nMessage: " + userMessage)
          )
      );

      String raw = restClient.post()
          .uri("/v1/chat/completions")
          .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
          .body(body)
          .retrieve()
          .body(String.class);

      if (raw == null || raw.isBlank()) return "Sorry, I couldn't get a response right now. Please try again.";

      JsonNode root = objectMapper.readTree(raw);
      JsonNode choices = root.get("choices");
      if (choices != null && choices.isArray() && choices.size() > 0) {
        JsonNode content = choices.get(0).path("message").path("content");
        if (!content.isMissingNode() && !content.isNull()) {
          return content.asText();
        }
      }
      return fallbackChat(customerName, userMessage, menuItems);
    } catch (Exception e) {
      return fallbackChat(customerName, userMessage, menuItems);
    }
  }

  private String fallbackChat(String customerName, String userMessage, List<MenuItem> menuItems) {
    String normalized = userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT);
    List<MenuItem> availableItems = menuItems == null
        ? List.of()
        : menuItems.stream()
            .filter(item -> Boolean.TRUE.equals(item.getIsAvailable()))
            .toList();

    if (availableItems.isEmpty()) {
      return "Hi " + safeCustomerName(customerName) + ", the menu is empty right now. Please check back in a moment.";
    }

    List<MenuItem> matchedItems = matchedItems(normalized, availableItems);
    boolean orderIntent = hasOrderIntent(normalized);

    if (orderIntent && !matchedItems.isEmpty()) {
      return buildOrderConfirmation(matchedItems);
    }

    List<MenuItem> recommendations = recommendItems(normalized, availableItems);
    String intro = "Hi " + safeCustomerName(customerName) + ", here are a few good picks for you:";
    String itemsText = recommendations.stream()
        .map(item -> "- " + item.getName() + " (" + item.getCategory() + ") - ₹" + formatAmount(item.getPrice()) + "\n  " + defaultText(item.getDescription(), "Chef's special"))
        .collect(Collectors.joining("\n"));

    String closing;
    if (orderIntent) {
      closing = "\n\nI couldn't confirm the exact dish from your message. Mention the item name directly, like \"place order for Paneer Tikka\", and I'll confirm it.";
    } else {
      closing = "\n\nIf you'd like, reply with \"order " + recommendations.get(0).getName() + "\" and I'll confirm it for you.";
    }

    return intro + "\n" + itemsText + closing;
  }

  private List<MenuItem> recommendItems(String normalizedMessage, List<MenuItem> availableItems) {
    boolean wantsVeg = normalizedMessage.contains("veg") || normalizedMessage.contains("vegetarian") || normalizedMessage.contains("paneer");
    boolean wantsNonVeg = normalizedMessage.contains("non veg") || normalizedMessage.contains("non-veg") || normalizedMessage.contains("chicken");
    double budget = extractBudget(normalizedMessage);

    return availableItems.stream()
        .filter(item -> !wantsVeg || Boolean.TRUE.equals(item.getIsVeg()))
        .filter(item -> !wantsNonVeg || !Boolean.TRUE.equals(item.getIsVeg()))
        .filter(item -> budget <= 0 || (item.getPrice() != null && item.getPrice() <= budget))
        .sorted(Comparator.comparing(MenuItem::getPrice, Comparator.nullsLast(Double::compareTo)))
        .limit(3)
        .collect(Collectors.collectingAndThen(Collectors.toList(), picks -> picks.isEmpty()
            ? availableItems.stream().limit(3).toList()
            : picks));
  }

  private List<MenuItem> matchedItems(String normalizedMessage, List<MenuItem> availableItems) {
    List<MenuItem> matches = new ArrayList<>();
    for (MenuItem item : availableItems) {
      String itemName = defaultText(item.getName(), "").toLowerCase(Locale.ROOT);
      if (!itemName.isBlank() && normalizedMessage.contains(itemName)) {
        matches.add(item);
      }
    }
    return matches;
  }

  private boolean hasOrderIntent(String normalizedMessage) {
    return normalizedMessage.contains("order")
        || normalizedMessage.contains("confirm")
        || normalizedMessage.contains("place")
        || normalizedMessage.contains("book");
  }

  private String buildOrderConfirmation(List<MenuItem> matchedItems) {
    double total = matchedItems.stream()
        .map(MenuItem::getPrice)
        .filter(price -> price != null)
        .mapToDouble(Double::doubleValue)
        .sum();

    List<Map<String, Object>> items = matchedItems.stream()
        .map(item -> Map.<String, Object>of(
            "name", item.getName(),
            "qty", 1,
            "price", item.getPrice() == null ? 0.0 : item.getPrice()
        ))
        .toList();

    try {
      String orderJson = objectMapper.writeValueAsString(Map.of(
          "items", items,
          "totalAmount", total
      ));
      return "Perfect, I've confirmed your order.\nORDER_CONFIRMED: " + orderJson;
    } catch (Exception e) {
      return "Perfect, I've confirmed your order for " + matchedItems.stream()
          .map(MenuItem::getName)
          .collect(Collectors.joining(", "))
          + ". Total: ₹" + formatAmount(total);
    }
  }

  private double extractBudget(String normalizedMessage) {
    String digits = normalizedMessage.replaceAll("[^0-9]", " ").trim();
    if (digits.isBlank()) {
      return 0;
    }

    String[] parts = digits.split("\\s+");
    for (String part : parts) {
      try {
        double value = Double.parseDouble(part);
        if (value > 0) {
          return value;
        }
      } catch (NumberFormatException ignored) {
      }
    }
    return 0;
  }

  private String safeCustomerName(String customerName) {
    if (customerName == null || customerName.isBlank()) {
      return "Guest";
    }
    return customerName.trim();
  }

  private String defaultText(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value;
  }

  private String formatAmount(double amount) {
    if (amount == Math.rint(amount)) {
      return String.valueOf((int) amount);
    }
    return String.format(Locale.ROOT, "%.2f", amount);
  }
}

