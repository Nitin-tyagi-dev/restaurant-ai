package com.restaurant.model;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class MenuItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(length = 1000)
  private String description;

  @Column(nullable = false)
  private Double price;

  @Column(nullable = false)
  private String category;

  @Column(nullable = false)
  private Boolean isVeg;

  @Column(nullable = false)
  private Boolean isAvailable;

  public MenuItem() {}

  public MenuItem(Long id, String name, String description, Double price, String category, Boolean isVeg, Boolean isAvailable) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.category = category;
    this.isVeg = isVeg;
    this.isAvailable = isAvailable;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Double getPrice() {
    return price;
  }

  public void setPrice(Double price) {
    this.price = price;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public Boolean getIsVeg() {
    return isVeg;
  }

  public void setIsVeg(Boolean veg) {
    isVeg = veg;
  }

  public Boolean getIsAvailable() {
    return isAvailable;
  }

  public void setIsAvailable(Boolean available) {
    isAvailable = available;
  }
}

