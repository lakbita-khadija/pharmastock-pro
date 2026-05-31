package com.pharmastock.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record CommandeRequest(
        @NotNull Long fournisseurId,
        @NotEmpty List<Ligne> lignes
) {
    public record Ligne(Long medicamentId, Integer quantite, BigDecimal prixUnitaire) {}
}
