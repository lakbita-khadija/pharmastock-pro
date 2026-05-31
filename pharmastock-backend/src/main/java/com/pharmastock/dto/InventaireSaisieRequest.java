package com.pharmastock.dto;
import java.util.List;
public record InventaireSaisieRequest(List<Ligne> lignes) {
    public record Ligne(Long medicamentId, Integer quantitePhysique) {}
}
