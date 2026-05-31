package com.pharmastock.entity;

import com.pharmastock.enums.OrdonnanceStatut;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ordonnances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ordonnance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) private String numeroOrdonnance;
    @Column(nullable = false) private String prescripteur;
    private String patient;
    @Column(nullable = false) private LocalDate datePrescription;
    private LocalDate dateValidite;

    @Enumerated(EnumType.STRING)
    @Builder.Default private OrdonnanceStatut statut = OrdonnanceStatut.EN_ATTENTE;

    @Builder.Default private LocalDateTime dateCreation = LocalDateTime.now();
}
