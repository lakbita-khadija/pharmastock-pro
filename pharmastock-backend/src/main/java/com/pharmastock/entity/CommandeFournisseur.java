package com.pharmastock.entity;

import com.pharmastock.enums.CommandeStatut;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes_fournisseur")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommandeFournisseur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) private String numeroCommande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @Builder.Default private LocalDateTime dateCreation = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default private CommandeStatut statut = CommandeStatut.BROUILLON;

    @Builder.Default private BigDecimal montantTotal = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par")
    private Utilisateur creePar;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<LigneCommande> lignes = new ArrayList<>();
}
