package com.pharmastock.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReceptionRequest(
        @NotNull Long commandeId,
        List<Ligne> lignes
) {
    public record Ligne(
            Long ligneCommandeId,
            Integer quantiteRecue,
            String numeroLot,
            LocalDate dateExpiration,
            BigDecimal prixAchatReel
    ) {}
}
