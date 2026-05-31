package com.pharmastock.entity;

import com.pharmastock.enums.AlerteNiveau;
import com.pharmastock.enums.AlerteStatut;
import com.pharmastock.enums.AlerteType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertes_stock")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlerteStock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private Lot lot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) private AlerteType typeAlerte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) private AlerteNiveau niveau;

    @Column(length = 500) private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default private AlerteStatut statut = AlerteStatut.ACTIVE;

    @Builder.Default private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acquitte_par")
    private Utilisateur acquittePar;

    private LocalDateTime dateAcquittement;
    private String commentaire;
}
