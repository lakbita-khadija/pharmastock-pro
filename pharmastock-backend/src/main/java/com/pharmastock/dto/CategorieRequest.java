package com.pharmastock.dto;
import jakarta.validation.constraints.NotBlank;
public record CategorieRequest(@NotBlank String nom, String description) {}
