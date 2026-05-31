package com.pharmastock.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fournisseurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Fournisseur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String nom;
    private String raisonSociale;
    private String telephone;
    private String email;
    private String adresse;
    private String ville;
    @Builder.Default private Integer delaiLivraisonJours = 3;
    @Builder.Default private boolean actif = true;
}
