package com.pharmastock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "lignes_vente")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneVente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id")
    private Vente vente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private Lot lot;

    @Column(nullable = false) private Integer quantite;
    @Builder.Default private BigDecimal prixUnitaire = BigDecimal.ZERO;
    @Builder.Default private BigDecimal remise = BigDecimal.ZERO;
    @Builder.Default private BigDecimal sousTotal = BigDecimal.ZERO;
}
