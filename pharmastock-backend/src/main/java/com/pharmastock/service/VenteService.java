package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.common.PageMapper;
import com.pharmastock.common.SimplePdf;
import com.pharmastock.dto.VenteRequest;
import com.pharmastock.entity.*;
import com.pharmastock.enums.LotStatut;
import com.pharmastock.enums.ModePaiement;
import com.pharmastock.enums.TypeMouvement;
import com.pharmastock.enums.VenteStatut;
import com.pharmastock.repository.MedicamentRepository;
import com.pharmastock.repository.VenteRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class VenteService {

    private final VenteRepository repo;
    private final MedicamentRepository medicamentRepo;
    private final StockService stockService;
    private final AlerteService alerteService;
    private final CurrentUserService currentUser;
    private final AuditLogService audit;

    public VenteService(VenteRepository repo, MedicamentRepository medicamentRepo, StockService stockService,
                        AlerteService alerteService, CurrentUserService currentUser, AuditLogService audit) {
        this.repo = repo;
        this.medicamentRepo = medicamentRepo;
        this.stockService = stockService;
        this.alerteService = alerteService;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    public Map<String, Object> getAll(String q, String dateFrom, String dateTo, int page, int size) {
        String query = (q == null) ? "" : q.trim();
        LocalDateTime from = (dateFrom == null || dateFrom.isBlank())
                ? LocalDateTime.of(1900, 1, 1, 0, 0) : LocalDate.parse(dateFrom).atStartOfDay();
        LocalDateTime to = (dateTo == null || dateTo.isBlank())
                ? LocalDateTime.of(2999, 12, 31, 23, 59, 59) : LocalDate.parse(dateTo).atTime(LocalTime.MAX);
        var result = repo.search(query, from, to, PageRequest.of(page, size));
        return PageMapper.of(result, Mapper::venteListe);
    }

    public Map<String, Object> getById(Long id) {
        return Mapper.venteDetail(find(id));
    }

    @Transactional
    public Map<String, Object> create(VenteRequest req) {
        if (req.lignes() == null || req.lignes().isEmpty()) {
            throw ApiException.badRequest("Le panier est vide.");
        }
        String numero = genererNumero();
        Vente vente = Vente.builder()
                .numeroVente(numero)
                .dateVente(LocalDateTime.now())
                .modePaiement(req.modePaiement() != null ? req.modePaiement() : ModePaiement.ESPECES)
                .montantDonne(req.montantDonne())
                .caissier(currentUser.get())
                .statut(VenteStatut.VALIDEE)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<LigneVente> lignes = new ArrayList<>();

        for (VenteRequest.Ligne l : req.lignes()) {
            Medicament med = medicamentRepo.findById(l.medicamentId())
                    .orElseThrow(() -> ApiException.badRequest("Medicament invalide."));
            int qte = l.quantite() != null ? l.quantite() : 1;
            BigDecimal remise = l.remise() != null ? l.remise() : BigDecimal.ZERO;
            BigDecimal prixUnitaire = med.getPrixVenteTtc();

            // sousTotal = prix * qte * (1 - remise/100)
            BigDecimal base = prixUnitaire.multiply(BigDecimal.valueOf(qte));
            BigDecimal facteur = BigDecimal.ONE.subtract(remise.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal sousTotal = base.multiply(facteur).setScale(2, RoundingMode.HALF_UP);

            // deduction FEFO
            List<Lot> lotsUtilises = stockService.deduireFefo(med, qte, numero);
            Lot lotPrincipal = lotsUtilises.isEmpty() ? null : lotsUtilises.get(0);

            LigneVente ligne = LigneVente.builder()
                    .vente(vente).medicament(med).lot(lotPrincipal)
                    .quantite(qte).prixUnitaire(prixUnitaire).remise(remise).sousTotal(sousTotal)
                    .build();
            lignes.add(ligne);
            total = total.add(sousTotal);
        }

        vente.setLignes(lignes);
        vente.setTotalTtc(total.setScale(2, RoundingMode.HALF_UP));
        vente = repo.save(vente);

        audit.log("VENTE", "Vente", numero + " - " + total + " DH");
        // reverifier les seuils apres la sortie de stock
        alerteService.verifierSeuils();

        return Mapper.venteDetail(vente);
    }

    @Transactional
    public void annuler(Long id, String motif) {
        Vente v = find(id);
        if (v.getStatut() == VenteStatut.ANNULEE) {
            throw ApiException.badRequest("Vente deja annulee.");
        }
        v.setStatut(VenteStatut.ANNULEE);
        v.setMotifAnnulation(motif);

        // remise en stock (RETOUR) sur le lot principal de chaque ligne
        for (LigneVente l : v.getLignes()) {
            Lot lot = l.getLot();
            if (lot != null) {
                lot.setQuantiteDisponible(lot.getQuantiteDisponible() + l.getQuantite());
                if (lot.getStatut() == LotStatut.EPUISE) lot.setStatut(LotStatut.ACTIF);
                stockService.recordMouvement(l.getMedicament(), lot, TypeMouvement.RETOUR,
                        l.getQuantite(), v.getNumeroVente(), "Annulation vente");
            }
        }
        repo.save(v);
        audit.log("ANNULATION_VENTE", "Vente", v.getNumeroVente() + " - " + motif);
    }

    public byte[] genererTicket(Long id) {
        Vente v = find(id);
        List<String> lines = new ArrayList<>();
        lines.add("PHARMASTOCK - Ticket de caisse");
        lines.add("Numero : " + v.getNumeroVente());
        lines.add("Date   : " + v.getDateVente().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        if (v.getCaissier() != null)
            lines.add("Caissier : " + v.getCaissier().getPrenom() + " " + v.getCaissier().getNom());
        lines.add("------------------------------------------");
        for (LigneVente l : v.getLignes()) {
            lines.add(l.getMedicament().getNomCommercial());
            lines.add("   " + l.getQuantite() + " x " + l.getPrixUnitaire() + " DH"
                    + (l.getRemise().signum() > 0 ? "  (-" + l.getRemise() + "%)" : "")
                    + "   = " + l.getSousTotal() + " DH");
        }
        lines.add("------------------------------------------");
        lines.add("TOTAL TTC : " + v.getTotalTtc() + " DH");
        lines.add("Mode de paiement : " + v.getModePaiement());
        if (v.getMontantDonne() != null) {
            lines.add("Montant recu : " + v.getMontantDonne() + " DH");
            BigDecimal rendu = v.getMontantDonne().subtract(v.getTotalTtc());
            if (rendu.signum() >= 0) lines.add("Rendu monnaie : " + rendu + " DH");
        }
        lines.add("");
        lines.add("Merci de votre visite !");
        return SimplePdf.fromLines(null, lines);
    }

    private String genererNumero() {
        String d = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long suffix = System.currentTimeMillis() % 100000;
        return "V-" + d + "-" + String.format("%05d", suffix);
    }

    private Vente find(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Vente introuvable."));
    }

    private String emptyToNull(String s) { return (s == null || s.isBlank()) ? null : s; }

}
