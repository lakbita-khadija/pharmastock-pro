package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.entity.AlerteStock;
import com.pharmastock.entity.Lot;
import com.pharmastock.entity.Medicament;
import com.pharmastock.enums.*;
import com.pharmastock.repository.AlerteStockRepository;
import com.pharmastock.repository.LotRepository;
import com.pharmastock.repository.MedicamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AlerteService {

    private final AlerteStockRepository repo;
    private final MedicamentRepository medicamentRepo;
    private final LotRepository lotRepo;
    private final StockService stockService;
    private final CurrentUserService currentUser;

    public AlerteService(AlerteStockRepository repo, MedicamentRepository medicamentRepo,
                         LotRepository lotRepo, StockService stockService, CurrentUserService currentUser) {
        this.repo = repo;
        this.medicamentRepo = medicamentRepo;
        this.lotRepo = lotRepo;
        this.stockService = stockService;
        this.currentUser = currentUser;
    }

    /** Renvoie une structure de page (le frontend lit data.content). */
    public Map<String, Object> getAll(String statut, String niveau, Integer size) {
        AlerteStatut st = parseEnum(AlerteStatut.class, statut);
        AlerteNiveau nv = parseEnum(AlerteNiveau.class, niveau);
        List<AlerteStock> list = repo.findAllByOrderByDateCreationDesc().stream()
                .filter(a -> st == null || a.getStatut() == st)
                .filter(a -> nv == null || a.getNiveau() == nv)
                .collect(Collectors.toList());
        if (size != null && size > 0 && list.size() > size) {
            list = new java.util.ArrayList<>(list.subList(0, size));
        }
        List<Map<String, Object>> content = list.stream().map(Mapper::alerte).collect(Collectors.toList());
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("totalElements", content.size());
        res.put("totalPages", 1);
        return res;
    }

    @Transactional
    public void acquitter(Long id, String commentaire) {
        AlerteStock a = repo.findById(id).orElseThrow(() -> ApiException.notFound("Alerte introuvable."));
        a.setStatut(AlerteStatut.ACQUITTEE);
        a.setAcquittePar(currentUser.get());
        a.setDateAcquittement(LocalDateTime.now());
        a.setCommentaire(commentaire);
        repo.save(a);
    }

    public Map<String, Object> count() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("count", repo.countByStatut(AlerteStatut.ACTIVE));
        return m;
    }

    // ============ Generation automatique ============
    @Transactional
    public void verifierSeuils() {
        for (Medicament m : medicamentRepo.findAll()) {
            if (!m.isActif()) continue;
            int stock = stockService.stockTotalActif(m.getId());
            if (stock == 0) {
                creerSiAbsente(m, null, AlerteType.RUPTURE, AlerteNiveau.CRITIQUE,
                        "Rupture de stock : " + m.getNomCommercial());
            } else if (stock <= m.getSeuilMinimal()) {
                creerSiAbsente(m, null, AlerteType.STOCK_FAIBLE, AlerteNiveau.AVERTISSEMENT,
                        "Stock faible (" + stock + " unites) pour " + m.getNomCommercial());
            }
        }
    }

    @Transactional
    public void verifierPeremptions() {
        LocalDate today = LocalDate.now();
        for (Lot lot : lotRepo.findExpiringBefore(today.plusDays(30))) {
            long jours = ChronoUnit.DAYS.between(today, lot.getDateExpiration());
            Medicament m = lot.getMedicament();
            if (jours < 0) {
                lot.setStatut(LotStatut.EXPIRE);
                lotRepo.save(lot);
                creerSiAbsenteLot(m, lot, AlerteType.LOT_EXPIRE, AlerteNiveau.BLOQUANT,
                        "Lot perime " + lot.getNumeroLot() + " (" + m.getNomCommercial() + ")");
            } else if (jours <= 7) {
                creerSiAbsenteLot(m, lot, AlerteType.PEREMPTION_7J, AlerteNiveau.CRITIQUE,
                        "Peremption sous 7j : lot " + lot.getNumeroLot() + " (" + m.getNomCommercial() + ")");
            } else {
                creerSiAbsenteLot(m, lot, AlerteType.PEREMPTION_30J, AlerteNiveau.AVERTISSEMENT,
                        "Peremption sous 30j : lot " + lot.getNumeroLot() + " (" + m.getNomCommercial() + ")");
            }
        }
    }

    private void creerSiAbsente(Medicament m, Lot lot, AlerteType type, AlerteNiveau niveau, String message) {
        if (repo.existsByMedicamentIdAndTypeAlerteAndStatut(m.getId(), type, AlerteStatut.ACTIVE)) return;
        repo.save(AlerteStock.builder()
                .medicament(m).lot(lot).typeAlerte(type).niveau(niveau)
                .message(message).statut(AlerteStatut.ACTIVE).build());
    }

    private void creerSiAbsenteLot(Medicament m, Lot lot, AlerteType type, AlerteNiveau niveau, String message) {
        if (repo.existsByLotIdAndTypeAlerteAndStatut(lot.getId(), type, AlerteStatut.ACTIVE)) return;
        repo.save(AlerteStock.builder()
                .medicament(m).lot(lot).typeAlerte(type).niveau(niveau)
                .message(message).statut(AlerteStatut.ACTIVE).build());
    }

    private <E extends Enum<E>> E parseEnum(Class<E> cls, String value) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(cls, value); } catch (Exception e) { return null; }
    }
}
