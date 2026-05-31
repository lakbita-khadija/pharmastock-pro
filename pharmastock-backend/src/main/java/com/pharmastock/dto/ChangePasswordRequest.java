package com.pharmastock.dto;
import jakarta.validation.constraints.NotBlank;
public record ChangePasswordRequest(@NotBlank String ancienMotDePasse, @NotBlank String nouveauMotDePasse) {}
