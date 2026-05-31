package com.pharmastock.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "lignes_commande")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneCommande {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id")
    private CommandeFournisseur commande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    @Column(nullable = false) private Integer quantiteCommandee;
    @Builder.Default private Integer quantiteRecue = 0;
    @Builder.Default private BigDecimal prixUnitaire = BigDecimal.ZERO;
}
