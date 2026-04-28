package com.restaurant.controller;

import com.restaurant.model.MenuItem;
import com.restaurant.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
  private final MenuService menuService;

  public MenuController(MenuService menuService) {
    this.menuService = menuService;
  }

  @GetMapping
  public List<MenuItem> getMenu(@RequestParam(name = "includeUnavailable", defaultValue = "false") boolean includeUnavailable) {
    return menuService.getMenu(includeUnavailable);
  }

  @PostMapping
  public ResponseEntity<MenuItem> create(@RequestBody MenuItem item) {
    if (item.getName() == null || item.getName().isBlank()) return ResponseEntity.badRequest().build();
    if (item.getPrice() == null) return ResponseEntity.badRequest().build();
    if (item.getCategory() == null || item.getCategory().isBlank()) return ResponseEntity.badRequest().build();
    return ResponseEntity.ok(menuService.create(item));
  }

  @PutMapping("/{id}")
  public ResponseEntity<MenuItem> update(@PathVariable Long id, @RequestBody MenuItem item) {
    return menuService.update(id, item)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    boolean ok = menuService.delete(id);
    return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
  }
}

