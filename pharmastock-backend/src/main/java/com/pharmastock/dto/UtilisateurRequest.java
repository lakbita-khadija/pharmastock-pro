package com.pharmastock.dto;

import com.pharmastock.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UtilisateurRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        @NotBlank @Email String email,
        String motDePasse,
        Role role,
        Boolean actif
) {}
