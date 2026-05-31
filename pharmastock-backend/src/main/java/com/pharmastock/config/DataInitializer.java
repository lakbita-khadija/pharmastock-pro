package com.pharmastock.config;

import com.pharmastock.entity.*;
import com.pharmastock.enums.*;
import com.pharmastock.repository.*;
import com.pharmastock.service.AlerteService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seed(UtilisateurRepository userRepo, PasswordEncoder encoder,
                           CategorieRepository catRepo, FournisseurRepository fourRepo,
                           MedicamentRepository medRepo, LotRepository lotRepo,
                           VenteRepository venteRepo, AlerteService alerteService) {
        return args -> {
            if (userRepo.count() > 0) return; // deja initialise

            String pwd = encoder.encode("Admin123!");
            userRepo.save(Utilisateur.builder().nom("Benani").prenom("Karim").email("admin@pharma.ma")
                    .motDePasse(pwd).role(Role.ADMIN).actif(true).build());
            userRepo.save(Utilisateur.builder().nom("Alaoui").prenom("Fatima").email("pharma@pharma.ma")
                    .motDePasse(pwd).role(Role.PHARMACIEN).actif(true).build());
            Utilisateur caissier = userRepo.save(Utilisateur.builder().nom("Tazi").prenom("Youssef")
                    .email("caissier@pharma.ma").motDePasse(pwd).role(Role.CAISSIER).actif(true).build());
            userRepo.save(Utilisateur.builder().nom("Idrissi").prenom("Salma").email("gestion@pharma.ma")
                    .motDePasse(pwd).role(Role.GESTIONNAIRE_STOCK).actif(true).build());

            Categorie antalgiques = catRepo.save(Categorie.builder().nom("Antalgiques").build());
            Categorie antibiotiques = catRepo.save(Categorie.builder().nom("Antibiotiques").build());
            Categorie antiInflam = catRepo.save(Categorie.builder().nom("Anti-inflammatoires").build());
            Categorie vitamines = catRepo.save(Categorie.builder().nom("Vitamines").build());
            Categorie cardio = catRepo.save(Categorie.builder().nom("Cardiologie").build());

            Fournisseur f1 = fourRepo.save(Fournisseur.builder().nom("Cooper Pharma").raisonSociale("Cooper Pharma SA")
                    .telephone("0522334455").email("contact@cooperpharma.ma").ville("Casablanca")
                    .delaiLivraisonJours(2).actif(true).build());
            Fournisseur f2 = fourRepo.save(Fournisseur.builder().nom("Sothema").raisonSociale("Sothema SA")
                    .telephone("0523445566").email("commande@sothema.ma").ville("Bouskoura")
                    .delaiLivraisonJours(3).actif(true).build());
            fourRepo.save(Fournisseur.builder().nom("Maphar").raisonSociale("Maphar SA")
                    .telephone("0522778899").email("info@maphar.ma").ville("Casablanca")
                    .delaiLivraisonJours(4).actif(true).build());

            // medicaments + lots
            List<Vente> sampleVentes = new ArrayList<>();

            Medicament doliprane = med("Doliprane 1000mg", "Paracetamol", "3400930001234", "Comprimé", "1000 mg",
                    antalgiques, StatutDispensation.LIBRE, "3.50", "12.00", 30);
            Medicament amoxicilline = med("Amoxicilline 500mg", "Amoxicilline", "3400930002345", "Gélule", "500 mg",
                    antibiotiques, StatutDispensation.ORDONNANCE, "8.00", "28.50", 20);
            Medicament ibuprofene = med("Ibuprofene 400mg", "Ibuprofene", "3400930003456", "Comprimé", "400 mg",
                    antiInflam, StatutDispensation.LIBRE, "4.00", "15.00", 25);
            Medicament vitamineC = med("Vitamine C 1000", "Acide ascorbique", "3400930004567", "Comprimé", "1000 mg",
                    vitamines, StatutDispensation.LIBRE, "2.00", "9.00", 40);
            Medicament aspirine = med("Aspirine 500mg", "Acide acetylsalicylique", "3400930005678", "Comprimé", "500 mg",
                    antalgiques, StatutDispensation.LIBRE, "2.50", "8.00", 30);
            Medicament augmentin = med("Augmentin 1g", "Amoxicilline/Ac. clavulanique", "3400930006789", "Comprimé", "1 g",
                    antibiotiques, StatutDispensation.ORDONNANCE, "15.00", "52.00", 15);
            Medicament voltarene = med("Voltarene 50mg", "Diclofenac", "3400930007890", "Comprimé", "50 mg",
                    antiInflam, StatutDispensation.LISTE_II, "6.00", "21.00", 20);
            Medicament magnesium = med("Magnesium B6", "Magnesium", "3400930008901", "Comprimé", "300 mg",
                    vitamines, StatutDispensation.LIBRE, "3.00", "11.50", 35);
            Medicament kardegic = med("Kardegic 75mg", "Acetylsalicylate", "3400930009012", "Sachet", "75 mg",
                    cardio, StatutDispensation.ORDONNANCE, "5.00", "18.00", 20);
            Medicament tramadol = med("Tramadol 50mg", "Tramadol", "3400930010123", "Gélule", "50 mg",
                    antalgiques, StatutDispensation.STUPEFIANT, "9.00", "32.00", 10);

            for (Medicament m : List.of(doliprane, amoxicilline, ibuprofene, vitamineC, aspirine,
                    augmentin, voltarene, magnesium, kardegic, tramadol)) {
                medRepo.save(m);
            }

            // Lots avec dates variees (perimes, proches, normaux)
            lotRepo.save(lot(doliprane, f1, "LOT-DOL-001", 150, LocalDate.now().plusMonths(14), "3.50"));
            lotRepo.save(lot(doliprane, f1, "LOT-DOL-002", 80, LocalDate.now().plusMonths(20), "3.50"));
            lotRepo.save(lot(amoxicilline, f2, "LOT-AMX-001", 12, LocalDate.now().plusDays(25), "8.00")); // stock faible + perime 30j
            lotRepo.save(lot(ibuprofene, f1, "LOT-IBU-001", 200, LocalDate.now().plusMonths(10), "4.00"));
            lotRepo.save(lot(vitamineC, f2, "LOT-VTC-001", 300, LocalDate.now().plusMonths(18), "2.00"));
            lotRepo.save(lot(aspirine, f1, "LOT-ASP-001", 5, LocalDate.now().plusDays(5), "2.50")); // critique + perime 7j
            lotRepo.save(lot(augmentin, f2, "LOT-AUG-001", 60, LocalDate.now().plusMonths(8), "15.00"));
            lotRepo.save(lot(voltarene, f1, "LOT-VOL-001", 18, LocalDate.now().plusMonths(6), "6.00")); // seuil bas
            lotRepo.save(lot(magnesium, f2, "LOT-MAG-001", 120, LocalDate.now().plusMonths(12), "3.00"));
            lotRepo.save(lot(kardegic, f1, "LOT-KAR-001", 0, LocalDate.now().plusMonths(9), "5.00")); // rupture
            lotRepo.save(lot(tramadol, f2, "LOT-TRA-EXP", 10, LocalDate.now().minusDays(10), "9.00")); // perime

            // Quelques ventes recentes (pour alimenter le dashboard)
            sampleVentes.add(vente("V-DEMO-0001", caissier, doliprane, 5, "12.00", LocalDateTime.now().minusDays(1)));
            sampleVentes.add(vente("V-DEMO-0002", caissier, ibuprofene, 3, "15.00", LocalDateTime.now().minusDays(1)));
            sampleVentes.add(vente("V-DEMO-0003", caissier, vitamineC, 8, "9.00", LocalDateTime.now()));
            sampleVentes.add(vente("V-DEMO-0004", caissier, augmentin, 2, "52.00", LocalDateTime.now()));
            sampleVentes.add(vente("V-DEMO-0005", caissier, doliprane, 4, "12.00", LocalDateTime.now().minusDays(3)));
            venteRepo.saveAll(sampleVentes);

            // Generation des alertes initiales
            alerteService.verifierPeremptions();
            alerteService.verifierSeuils();

            System.out.println("======================================================");
            System.out.println("  PharmaStock : donnees de demonstration initialisees.");
            System.out.println("  Comptes (mot de passe : Admin123!) :");
            System.out.println("    admin@pharma.ma     (ADMIN)");
            System.out.println("    pharma@pharma.ma    (PHARMACIEN)");
            System.out.println("    caissier@pharma.ma  (CAISSIER)");
            System.out.println("    gestion@pharma.ma   (GESTIONNAIRE_STOCK)");
            System.out.println("======================================================");
        };
    }

    private Medicament med(String nom, String dci, String code, String forme, String dosage,
                           Categorie cat, StatutDispensation statut, String achat, String vente, int seuil) {
        return Medicament.builder()
                .nomCommercial(nom).dci(dci).codeBarre(code).formegalenique(forme).dosage(dosage)
                .categorie(cat).statutDispensation(statut)
                .prixAchatHt(new BigDecimal(achat)).prixVenteTtc(new BigDecimal(vente))
                .seuilMinimal(seuil).actif(true).build();
    }

    private Lot lot(Medicament m, Fournisseur f, String numero, int qte, LocalDate exp, String prixAchat) {
        return Lot.builder()
                .medicament(m).fournisseur(f).numeroLot(numero)
                .quantiteInitiale(qte).quantiteDisponible(qte)
                .dateExpiration(exp).prixAchat(new BigDecimal(prixAchat))
                .statut(qte > 0 ? LotStatut.ACTIF : LotStatut.EPUISE).build();
    }

    private Vente vente(String numero, Utilisateur caissier, Medicament med, int qte, String prix, LocalDateTime date) {
        BigDecimal pu = new BigDecimal(prix);
        BigDecimal total = pu.multiply(BigDecimal.valueOf(qte));
        Vente v = Vente.builder()
                .numeroVente(numero).caissier(caissier).dateVente(date)
                .modePaiement(ModePaiement.ESPECES).montantDonne(total)
                .totalTtc(total).statut(VenteStatut.VALIDEE).build();
        LigneVente l = LigneVente.builder()
                .vente(v).medicament(med).quantite(qte)
                .prixUnitaire(pu).remise(BigDecimal.ZERO).sousTotal(total).build();
        v.getLignes().add(l);
        return v;
    }
}
