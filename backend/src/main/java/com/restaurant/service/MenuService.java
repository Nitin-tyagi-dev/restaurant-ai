package com.restaurant.service;

import com.restaurant.model.MenuItem;
import com.restaurant.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {
  private final MenuItemRepository menuItemRepository;

  public MenuService(MenuItemRepository menuItemRepository) {
    this.menuItemRepository = menuItemRepository;
  }

  public List<MenuItem> getMenu(boolean includeUnavailable) {
    return includeUnavailable ? menuItemRepository.findAll() : menuItemRepository.findByIsAvailableTrue();
  }

  public MenuItem create(MenuItem item) {
    item.setId(null);
    if (item.getIsAvailable() == null) item.setIsAvailable(true);
    if (item.getIsVeg() == null) item.setIsVeg(false);
    return menuItemRepository.save(item);
  }

  public Optional<MenuItem> update(Long id, MenuItem updated) {
    return menuItemRepository.findById(id).map(existing -> {
      existing.setName(updated.getName());
      existing.setDescription(updated.getDescription());
      existing.setPrice(updated.getPrice());
      existing.setCategory(updated.getCategory());
      existing.setIsVeg(updated.getIsVeg());
      existing.setIsAvailable(updated.getIsAvailable());
      return menuItemRepository.save(existing);
    });
  }

  public boolean delete(Long id) {
    if (!menuItemRepository.existsById(id)) return false;
    menuItemRepository.deleteById(id);
    return true;
  }
}

