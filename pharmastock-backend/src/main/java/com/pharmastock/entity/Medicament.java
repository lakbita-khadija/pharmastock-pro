package com.pharmastock.entity;

import com.pharmastock.enums.StatutDispensation;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicaments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Medicament {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String nomCommercial;
    @Column(nullable = false) private String dci;
    private String codeBarre;
    private String formegalenique;
    private String dosage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @Enumerated(EnumType.STRING)
    @Builder.Default private StatutDispensation statutDispensation = StatutDispensation.LIBRE;

    @Builder.Default private BigDecimal prixAchatHt = BigDecimal.ZERO;
    @Builder.Default private BigDecimal prixVenteTtc = BigDecimal.ZERO;
    @Builder.Default private Integer seuilMinimal = 10;
    @Builder.Default private boolean actif = true;
    @Builder.Default private LocalDateTime dateCreation = LocalDateTime.now();
}
