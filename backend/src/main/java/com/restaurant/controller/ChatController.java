package com.restaurant.controller;

import com.restaurant.model.MenuItem;
import com.restaurant.service.ClaudeService;
import com.restaurant.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
  private final ClaudeService claudeService;
  private final MenuService menuService;

  public ChatController(ClaudeService claudeService, MenuService menuService) {
    this.claudeService = claudeService;
    this.menuService = menuService;
  }

  public record ChatRequest(String message, String customerName) {}

  @PostMapping
  public ResponseEntity<String> chat(@RequestBody ChatRequest req) {
    if (req == null || req.message() == null || req.message().isBlank()) return ResponseEntity.badRequest().body("Message is required");
    String customer = (req.customerName() == null || req.customerName().isBlank()) ? "Guest" : req.customerName().trim();

    List<MenuItem> menu = menuService.getMenu(true);
    String response = claudeService.chat(customer, req.message().trim(), menu);
    return ResponseEntity.ok(response);
  }
}

