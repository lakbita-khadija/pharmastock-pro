package com.pharmastock.entity;

import com.pharmastock.enums.LotStatut;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Lot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @Column(nullable = false) private String numeroLot;
    @Builder.Default private Integer quantiteInitiale = 0;
    @Builder.Default private Integer quantiteDisponible = 0;
    @Column(nullable = false) private LocalDate dateExpiration;
    @Builder.Default private BigDecimal prixAchat = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default private LotStatut statut = LotStatut.ACTIF;

    @Builder.Default private LocalDateTime dateReception = LocalDateTime.now();
}
