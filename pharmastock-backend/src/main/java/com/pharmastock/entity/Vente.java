package com.pharmastock.entity;

import com.pharmastock.enums.ModePaiement;
import com.pharmastock.enums.VenteStatut;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) private String numeroVente;
    @Builder.Default private LocalDateTime dateVente = LocalDateTime.now();
    @Builder.Default private BigDecimal totalTtc = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default private ModePaiement modePaiement = ModePaiement.ESPECES;

    private BigDecimal montantDonne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caissier_id")
    private Utilisateur caissier;

    @Enumerated(EnumType.STRING)
    @Builder.Default private VenteStatut statut = VenteStatut.VALIDEE;

    private String motifAnnulation;

    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<LigneVente> lignes = new ArrayList<>();
}
