package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.entity.*;
import com.pharmastock.enums.LotStatut;
import com.pharmastock.enums.TypeMouvement;
import com.pharmastock.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final MedicamentRepository medicamentRepo;
    private final LotRepository lotRepo;
    private final MouvementStockRepository mouvementRepo;
    private final CurrentUserService currentUser;

    public StockService(MedicamentRepository medicamentRepo, LotRepository lotRepo,
                        MouvementStockRepository mouvementRepo, CurrentUserService currentUser) {
        this.medicamentRepo = medicamentRepo;
        this.lotRepo = lotRepo;
        this.mouvementRepo = mouvementRepo;
        this.currentUser = currentUser;
    }

    // ============ Vue stock paginee ============
    public Map<String, Object> getStock(String q, String expFilter, int page, int size) {
        LocalDate today = LocalDate.now();
        List<Medicament> meds = medicamentRepo.findAll().stream()
                .filter(Medicament::isActif)
                .filter(m -> matchQuery(m, q))
                .collect(Collectors.toList());

        List<Map<String, Object>> items = new ArrayList<>();
        for (Medicament m : meds) {
            List<Lot> lots = lotRepo.findByMedicamentIdOrderByDateExpirationAsc(m.getId());
            List<Lot> visibles = lots.stream()
                    .filter(l -> l.getQuantiteDisponible() != null && l.getQuantiteDisponible() > 0
                            && l.getStatut() != LotStatut.EPUISE)
                    .collect(Collectors.toList());

            int stockTotal = visibles.stream()
                    .filter(l -> l.getStatut() == LotStatut.ACTIF)
                    .mapToInt(Lot::getQuantiteDisponible).sum();
            int nbLots = (int) visibles.stream().filter(l -> l.getStatut() == LotStatut.ACTIF).count();
            LocalDate prochaine = visibles.stream()
                    .filter(l -> l.getStatut() == LotStatut.ACTIF)
                    .map(Lot::getDateExpiration)
                    .min(Comparator.naturalOrder()).orElse(null);

            if (!passesExpFilter(expFilter, stockTotal, m.getSeuilMinimal(), visibles, today)) continue;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("medicamentId", m.getId());
            item.put("nomCommercial", m.getNomCommercial());
            item.put("dci", m.getDci());
            item.put("categorie", m.getCategorie() != null ? m.getCategorie().getNom() : null);
            item.put("stockTotal", stockTotal);
            item.put("seuilMinimal", m.getSeuilMinimal());
            item.put("nbLots", nbLots);
            item.put("prochainExpiration", prochaine);
            item.put("lots", visibles.stream().map(Mapper::lot).collect(Collectors.toList()));
            items.add(item);
        }

        // pagination manuelle
        int total = items.size();
        int totalPages = (int) Math.ceil(total / (double) Math.max(size, 1));
        int fromIdx = Math.min(page * size, total);
        int toIdx = Math.min(fromIdx + size, total);
        List<Map<String, Object>> content = items.subList(fromIdx, toIdx);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("totalElements", total);
        res.put("totalPages", totalPages);
        res.put("number", page);
        res.put("size", size);
        return res;
    }

    private boolean matchQuery(Medicament m, String q) {
        if (q == null || q.isBlank()) return true;
        String s = q.toLowerCase();
        return (m.getNomCommercial() != null && m.getNomCommercial().toLowerCase().contains(s))
                || (m.getDci() != null && m.getDci().toLowerCase().contains(s));
    }

    private boolean passesExpFilter(String filter, int stockTotal, int seuil, List<Lot> lots, LocalDate today) {
        if (filter == null || filter.isBlank() || "all".equals(filter)) return true;
        switch (filter) {
            case "low":
                return stockTotal <= seuil;
            case "expired":
                return lots.stream().anyMatch(l -> l.getDateExpiration().isBefore(today)
                        || l.getStatut() == LotStatut.EXPIRE);
            case "30":
                return lots.stream().anyMatch(l -> !l.getDateExpiration().isBefore(today)
                        && ChronoUnit.DAYS.between(today, l.getDateExpiration()) <= 30);
            case "7":
                return lots.stream().anyMatch(l -> !l.getDateExpiration().isBefore(today)
                        && ChronoUnit.DAYS.between(today, l.getDateExpiration()) <= 7);
            default:
                return true;
        }
    }

    // ============ Mouvements / Lots ============
    public List<Map<String, Object>> getMouvements(Long medId) {
        return mouvementRepo.findByMedicamentIdOrderByDateOperationDesc(medId).stream()
                .map(Mapper::mouvement).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLots(Long medId) {
        return lotRepo.findByMedicamentIdOrderByDateExpirationAsc(medId).stream()
                .map(Mapper::lot).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllLots() {
        return lotRepo.findAll().stream().map(Mapper::lot).collect(Collectors.toList());
    }

    public void bloquerLot(Long lotId) {
        Lot lot = lotRepo.findById(lotId).orElseThrow(() -> ApiException.notFound("Lot introuvable."));
        lot.setStatut(lot.getStatut() == LotStatut.BLOQUE ? LotStatut.ACTIF : LotStatut.BLOQUE);
        lotRepo.save(lot);
    }

    public List<Map<String, Object>> getLotsByExpiry(Integer jours) {
        int j = jours != null ? jours : 30;
        LocalDate limite = LocalDate.now().plusDays(j);
        return lotRepo.findExpiringBefore(limite).stream().map(Mapper::lot).collect(Collectors.toList());
    }

    // ============ Helpers metier (utilises par Vente / Commande) ============

    public int stockTotalActif(Long medId) {
        return lotRepo.findFefoLots(medId).stream().mapToInt(Lot::getQuantiteDisponible).sum();
    }

    /** Deduit `quantite` selon FEFO (lots qui perimes en premier). Cree les mouvements SORTIE. */
    @Transactional
    public List<Lot> deduireFefo(Medicament med, int quantite, String reference) {
        List<Lot> fefo = lotRepo.findFefoLots(med.getId());
        int dispo = fefo.stream().mapToInt(Lot::getQuantiteDisponible).sum();
        if (dispo < quantite) {
            throw ApiException.badRequest("Stock insuffisant pour " + med.getNomCommercial()
                    + " (disponible : " + dispo + ", demande : " + quantite + ").");
        }
        List<Lot> utilises = new ArrayList<>();
        int restant = quantite;
        for (Lot lot : fefo) {
            if (restant <= 0) break;
            int pris = Math.min(restant, lot.getQuantiteDisponible());
            lot.setQuantiteDisponible(lot.getQuantiteDisponible() - pris);
            if (lot.getQuantiteDisponible() == 0) lot.setStatut(LotStatut.EPUISE);
            lotRepo.save(lot);
            recordMouvement(med, lot, TypeMouvement.SORTIE, pris, reference, "Vente");
            utilises.add(lot);
            restant -= pris;
        }
        return utilises;
    }

    @Transactional
    public Lot ajouterLot(Medicament med, Fournisseur fournisseur, String numeroLot,
                          int quantite, LocalDate dateExpiration, java.math.BigDecimal prixAchat, String reference) {
        Lot lot = Lot.builder()
                .medicament(med)
                .fournisseur(fournisseur)
                .numeroLot(numeroLot)
                .quantiteInitiale(quantite)
                .quantiteDisponible(quantite)
                .dateExpiration(dateExpiration)
                .prixAchat(prixAchat != null ? prixAchat : java.math.BigDecimal.ZERO)
                .statut(LotStatut.ACTIF)
                .build();
        lot = lotRepo.save(lot);
        recordMouvement(med, lot, TypeMouvement.ENTREE, quantite, reference, "Reception commande");
        return lot;
    }

    @Transactional
    public void recordMouvement(Medicament med, Lot lot, TypeMouvement type, int qty, String ref, String commentaire) {
        MouvementStock mv = MouvementStock.builder()
                .medicament(med).lot(lot).typeOperation(type).quantite(qty)
                .utilisateur(currentUser.get()).reference(ref).commentaire(commentaire)
                .build();
        mouvementRepo.save(mv);
    }
}
