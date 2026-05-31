package com.pharmastock.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lignes_inventaire")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneInventaire {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventaire_id")
    private Inventaire inventaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    @Builder.Default private Integer quantiteTheorique = 0;
    private Integer quantitePhysique;
    @Builder.Default private Integer ecart = 0;
}
