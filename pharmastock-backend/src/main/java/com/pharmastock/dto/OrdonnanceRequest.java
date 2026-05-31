package com.pharmastock.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record OrdonnanceRequest(
        @NotBlank String prescripteur,
        String patient,
        @NotNull LocalDate datePrescription,
        LocalDate dateValidite
) {}
