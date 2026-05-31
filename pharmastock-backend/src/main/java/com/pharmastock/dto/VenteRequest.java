package com.pharmastock.dto;

import com.pharmastock.enums.ModePaiement;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

public record VenteRequest(
        @NotEmpty List<Ligne> lignes,
        ModePaiement modePaiement,
        BigDecimal montantDonne
) {
    public record Ligne(Long medicamentId, Integer quantite, BigDecimal remise) {}
}
