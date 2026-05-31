package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.dto.CommandeRequest;
import com.pharmastock.dto.ReceptionRequest;
import com.pharmastock.entity.*;
import com.pharmastock.enums.CommandeStatut;
import com.pharmastock.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommandeService {

    private final CommandeFournisseurRepository repo;
    private final LigneCommandeRepository ligneRepo;
    private final FournisseurRepository fournisseurRepo;
    private final MedicamentRepository medicamentRepo;
    private final StockService stockService;
    private final CurrentUserService currentUser;
    private final AuditLogService audit;

    public CommandeService(CommandeFournisseurRepository repo, LigneCommandeRepository ligneRepo,
                           FournisseurRepository fournisseurRepo, MedicamentRepository medicamentRepo,
                           StockService stockService, CurrentUserService currentUser, AuditLogService audit) {
        this.repo = repo;
        this.ligneRepo = ligneRepo;
        this.fournisseurRepo = fournisseurRepo;
        this.medicamentRepo = medicamentRepo;
        this.stockService = stockService;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    public List<Map<String, Object>> getAll(String statut) {
        List<CommandeFournisseur> list;
        if (statut == null || statut.isBlank()) {
            list = repo.findAllByOrderByDateCreationDesc();
        } else {
            try {
                list = repo.findByStatutOrderByDateCreationDesc(CommandeStatut.valueOf(statut));
            } catch (IllegalArgumentException e) {
                list = repo.findAllByOrderByDateCreationDesc();
            }
        }
        return list.stream().map(Mapper::commande).collect(Collectors.toList());
    }

    public Map<String, Object> getById(Long id) {
        return Mapper.commande(find(id));
    }

    @Transactional
    public Map<String, Object> create(CommandeRequest req) {
        Fournisseur four = fournisseurRepo.findById(req.fournisseurId())
                .orElseThrow(() -> ApiException.badRequest("Fournisseur invalide."));

        CommandeFournisseur cmd = CommandeFournisseur.builder()
                .numeroCommande(genererNumero())
                .fournisseur(four)
                .statut(CommandeStatut.BROUILLON)
                .creePar(currentUser.get())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<LigneCommande> lignes = new ArrayList<>();
        for (CommandeRequest.Ligne l : req.lignes()) {
            Medicament med = medicamentRepo.findById(l.medicamentId())
                    .orElseThrow(() -> ApiException.badRequest("Medicament invalide."));
            int qte = l.quantite() != null ? l.quantite() : 1;
            BigDecimal prix = l.prixUnitaire() != null ? l.prixUnitaire() : BigDecimal.ZERO;
            lignes.add(LigneCommande.builder()
                    .commande(cmd).medicament(med).quantiteCommandee(qte)
                    .quantiteRecue(0).prixUnitaire(prix).build());
            total = total.add(prix.multiply(BigDecimal.valueOf(qte)));
        }
        cmd.setLignes(lignes);
        cmd.setMontantTotal(total);
        cmd = repo.save(cmd);
        audit.log("CREATE", "Commande", cmd.getNumeroCommande());
        return Mapper.commande(cmd);
    }

    @Transactional
    public void envoyer(Long id) {
        CommandeFournisseur c = find(id);
        if (c.getStatut() != CommandeStatut.BROUILLON) {
            throw ApiException.badRequest("Seules les commandes en brouillon peuvent etre envoyees.");
        }
        c.setStatut(CommandeStatut.ENVOYEE);
        repo.save(c);
        audit.log("ENVOI", "Commande", c.getNumeroCommande());
    }

    @Transactional
    public void annuler(Long id) {
        CommandeFournisseur c = find(id);
        if (c.getStatut() == CommandeStatut.RECUE_TOTALE) {
            throw ApiException.badRequest("Impossible d'annuler une commande totalement recue.");
        }
        c.setStatut(CommandeStatut.ANNULEE);
        repo.save(c);
        audit.log("ANNULATION", "Commande", c.getNumeroCommande());
    }

    @Transactional
    public Map<String, Object> receptionner(ReceptionRequest req) {
        CommandeFournisseur cmd = find(req.commandeId());
        if (cmd.getStatut() == CommandeStatut.ANNULEE) {
            throw ApiException.badRequest("Commande annulee.");
        }
        if (req.lignes() == null || req.lignes().isEmpty()) {
            throw ApiException.badRequest("Aucune ligne de reception.");
        }

        for (ReceptionRequest.Ligne rl : req.lignes()) {
            LigneCommande lc = cmd.getLignes().stream()
                    .filter(x -> x.getId().equals(rl.ligneCommandeId()))
                    .findFirst()
                    .orElseThrow(() -> ApiException.badRequest("Ligne de commande introuvable."));

            int recu = rl.quantiteRecue() != null ? rl.quantiteRecue() : 0;
            if (recu <= 0) continue;
            if (rl.numeroLot() == null || rl.numeroLot().isBlank() || rl.dateExpiration() == null) {
                throw ApiException.badRequest("Numero de lot et date d'expiration obligatoires.");
            }

            stockService.ajouterLot(lc.getMedicament(), cmd.getFournisseur(),
                    rl.numeroLot(), recu, rl.dateExpiration(), rl.prixAchatReel(), cmd.getNumeroCommande());

            lc.setQuantiteRecue(lc.getQuantiteRecue() + recu);
            if (rl.prixAchatReel() != null) lc.setPrixUnitaire(rl.prixAchatReel());
            ligneRepo.save(lc);
        }

        // statut : totale si toutes les lignes sont completes, sinon partielle
        boolean toutRecu = cmd.getLignes().stream()
                .allMatch(l -> l.getQuantiteRecue() >= l.getQuantiteCommandee());
        cmd.setStatut(toutRecu ? CommandeStatut.RECUE_TOTALE : CommandeStatut.RECUE_PARTIELLE);
        cmd = repo.save(cmd);
        audit.log("RECEPTION", "Commande", cmd.getNumeroCommande());
        return Mapper.commande(cmd);
    }

    private String genererNumero() {
        String d = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long suffix = System.currentTimeMillis() % 100000;
        return "CMD-" + d + "-" + String.format("%05d", suffix);
    }

    private CommandeFournisseur find(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Commande introuvable."));
    }
}
