package com.restaurant.service;

import com.restaurant.model.Order;
import com.restaurant.repository.OrderRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
  private final OrderRepository orderRepository;

  public OrderService(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
  }

  public Order create(Order order) {
    order.setId(null);
    if (order.getStatus() == null || order.getStatus().isBlank()) order.setStatus("PENDING");
    order.setCreatedAt(LocalDateTime.now());
    return orderRepository.save(order);
  }

  public List<Order> getAllNewestFirst() {
    return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
  }

  public Optional<Order> updateStatus(Long id, String status) {
    return orderRepository.findById(id).map(existing -> {
      existing.setStatus(status);
      return orderRepository.save(existing);
    });
  }
}

