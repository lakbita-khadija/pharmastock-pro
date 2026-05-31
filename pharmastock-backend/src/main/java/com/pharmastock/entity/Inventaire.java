package com.pharmastock.entity;

import com.pharmastock.enums.InventaireStatut;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventaires")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventaire {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default private String type = "Total";
    @Builder.Default private LocalDateTime dateDebut = LocalDateTime.now();
    private LocalDateTime dateValidation;

    @Enumerated(EnumType.STRING)
    @Builder.Default private InventaireStatut statut = InventaireStatut.EN_COURS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par")
    private Utilisateur creePar;

    @OneToMany(mappedBy = "inventaire", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<LigneInventaire> lignes = new ArrayList<>();
}
