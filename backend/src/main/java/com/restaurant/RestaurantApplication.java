package com.restaurant;

import com.restaurant.model.MenuItem;
import com.restaurant.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class RestaurantApplication {

  public static void main(String[] args) {
    SpringApplication.run(RestaurantApplication.class, args);
  }

  @Bean
  CommandLineRunner seedMenu(MenuItemRepository menuItemRepository) {
    return args -> {
      if (menuItemRepository.count() > 0) return;

      List<MenuItem> seed = List.of(
          new MenuItem(null, "Paneer Tikka", "Char-grilled paneer cubes with mint chutney", 220.0, "Starter", true, true),
          new MenuItem(null, "Chicken 65", "Spicy South-Indian style fried chicken", 260.0, "Starter", false, true),
          new MenuItem(null, "Veg Hara Bhara Kebab", "Spinach & pea kebabs served with dip", 190.0, "Starter", true, true),

          new MenuItem(null, "Butter Chicken", "Creamy tomato gravy with tender chicken", 320.0, "Main Course", false, true),
          new MenuItem(null, "Paneer Butter Masala", "Rich buttery gravy with cottage cheese", 290.0, "Main Course", true, true),
          new MenuItem(null, "Dal Makhani", "Slow-cooked black lentils, creamy and smoky", 240.0, "Main Course", true, true),
          new MenuItem(null, "Hyderabadi Chicken Biryani", "Aromatic basmati rice with spices and chicken", 350.0, "Main Course", false, true),

          new MenuItem(null, "Masala Chaas", "Refreshing spiced buttermilk", 90.0, "Drink", true, true),
          new MenuItem(null, "Mango Lassi", "Thick sweet yogurt drink with mango", 120.0, "Drink", true, true),

          new MenuItem(null, "Gulab Jamun (2 pcs)", "Soft milk dumplings soaked in syrup", 110.0, "Dessert", true, true)
      );

      menuItemRepository.saveAll(seed);
    };
  }
}

