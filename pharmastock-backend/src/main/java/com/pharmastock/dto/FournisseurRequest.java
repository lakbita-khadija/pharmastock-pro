package com.pharmastock.dto;
import jakarta.validation.constraints.NotBlank;
public record FournisseurRequest(
        @NotBlank String nom,
        String raisonSociale,
        String telephone,
        String email,
        String adresse,
        String ville,
        Integer delaiLivraisonJours,
        Boolean actif
) {}
