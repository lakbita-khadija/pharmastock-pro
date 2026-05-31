package com.pharmastock.entity;

import com.pharmastock.enums.TypeMouvement;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mouvements_stock")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MouvementStock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private Lot lot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) private TypeMouvement typeOperation;

    @Column(nullable = false) private Integer quantite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Builder.Default private LocalDateTime dateOperation = LocalDateTime.now();
    private String reference;
    private String commentaire;
}
