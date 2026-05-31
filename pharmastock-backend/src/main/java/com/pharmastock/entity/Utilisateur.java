package com.pharmastock.entity;

import com.pharmastock.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Utilisateur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String nom;
    @Column(nullable = false) private String prenom;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) private Role role;

    @Builder.Default private boolean actif = true;
    @Builder.Default private int tentativesEchec = 0;

    private LocalDateTime derniereConnexion;
    @Builder.Default private LocalDateTime dateCreation = LocalDateTime.now();
}
