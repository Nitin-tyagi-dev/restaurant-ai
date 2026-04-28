package com.restaurant.controller;

import com.restaurant.model.Order;
import com.restaurant.service.OrderService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  public record CreateOrderRequest(
      @NotBlank String customerName,
      @NotBlank String items,
      Double totalAmount
  ) {}

  public record UpdateStatusRequest(@NotBlank String status) {}

  @PostMapping
  public ResponseEntity<Order> create(@RequestBody CreateOrderRequest req) {
    if (req.customerName() == null || req.customerName().isBlank()) return ResponseEntity.badRequest().build();
    if (req.items() == null || req.items().isBlank()) return ResponseEntity.badRequest().build();
    if (req.totalAmount() == null) return ResponseEntity.badRequest().build();

    Order o = new Order();
    o.setCustomerName(req.customerName());
    o.setItems(req.items());
    o.setTotalAmount(req.totalAmount());
    o.setStatus("PENDING");
    return ResponseEntity.ok(orderService.create(o));
  }

  @GetMapping
  public List<Order> getAll() {
    return orderService.getAllNewestFirst();
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest req) {
    if (req.status() == null || req.status().isBlank()) return ResponseEntity.badRequest().build();
    String status = req.status().trim().toUpperCase();
    if (!status.equals("PENDING") && !status.equals("CONFIRMED") && !status.equals("DELIVERED")) {
      return ResponseEntity.badRequest().build();
    }
    return orderService.updateStatus(id, status)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}

