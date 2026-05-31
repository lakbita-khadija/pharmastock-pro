package com.pharmastock.dto;

import com.pharmastock.enums.StatutDispensation;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record MedicamentRequest(
        @NotBlank String nomCommercial,
        @NotBlank String dci,
        String codeBarre,
        String formegalenique,
        String dosage,
        Long categorieId,
        StatutDispensation statutDispensation,
        BigDecimal prixAchatHt,
        BigDecimal prixVenteTtc,
        Integer seuilMinimal,
        Boolean actif
) {}
