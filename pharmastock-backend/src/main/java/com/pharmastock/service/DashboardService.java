package com.pharmastock.service;

import com.pharmastock.entity.Lot;
import com.pharmastock.entity.Medicament;
import com.pharmastock.enums.AlerteNiveau;
import com.pharmastock.enums.AlerteStatut;
import com.pharmastock.enums.LotStatut;
import com.pharmastock.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final VenteRepository venteRepo;
    private final MedicamentRepository medicamentRepo;
    private final LotRepository lotRepo;
    private final AlerteStockRepository alerteRepo;
    private final LigneVenteRepository ligneVenteRepo;

    public DashboardService(VenteRepository venteRepo, MedicamentRepository medicamentRepo, LotRepository lotRepo,
                            AlerteStockRepository alerteRepo, LigneVenteRepository ligneVenteRepo) {
        this.venteRepo = venteRepo;
        this.medicamentRepo = medicamentRepo;
        this.lotRepo = lotRepo;
        this.alerteRepo = alerteRepo;
        this.ligneVenteRepo = ligneVenteRepo;
    }

    public Map<String, Object> kpis() {
        LocalDate today = LocalDate.now();
        LocalDateTime startDay = today.atStartOfDay();
        LocalDateTime startNextDay = today.plusDays(1).atStartOfDay();
        LocalDateTime startMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startMonthNext = today.withDayOfMonth(1).plusMonths(1).atStartOfDay();
        LocalDateTime startPrevMonth = today.withDayOfMonth(1).minusMonths(1).atStartOfDay();

        // valeur du stock (lots actifs, au prix d'achat)
        BigDecimal valeurStock = BigDecimal.ZERO;
        for (Lot lot : lotRepo.findByStatut(LotStatut.ACTIF)) {
            Medicament m = lot.getMedicament();
            BigDecimal prix = (lot.getPrixAchat() != null && lot.getPrixAchat().signum() > 0)
                    ? lot.getPrixAchat()
                    : (m != null ? m.getPrixAchatHt() : BigDecimal.ZERO);
            if (prix == null) prix = BigDecimal.ZERO;
            valeurStock = valeurStock.add(prix.multiply(BigDecimal.valueOf(lot.getQuantiteDisponible())));
        }

        long nbMedicaments = medicamentRepo.findAll().stream().filter(Medicament::isActif).count();
        BigDecimal caJour = venteRepo.sumTotalBetween(startDay, startNextDay);
        long ventesJour = venteRepo.countBetween(startDay, startNextDay);
        BigDecimal caMois = venteRepo.sumTotalBetween(startMonth, startMonthNext);
        BigDecimal caMoisPrec = venteRepo.sumTotalBetween(startPrevMonth, startMonth);
        long alertesActives = alerteRepo.countByStatut(AlerteStatut.ACTIVE);
        long alertesCritiques = alerteRepo.countByStatutAndNiveau(AlerteStatut.ACTIVE, AlerteNiveau.CRITIQUE);

        int evo = 0;
        if (caMoisPrec != null && caMoisPrec.signum() > 0) {
            evo = caMois.subtract(caMoisPrec)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(caMoisPrec, 0, RoundingMode.HALF_UP).intValue();
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("valeurStock", valeurStock.setScale(2, RoundingMode.HALF_UP));
        m.put("nbMedicaments", nbMedicaments);
        m.put("caJour", caJour);
        m.put("ventesJour", ventesJour);
        m.put("alertesActives", alertesActives);
        m.put("alertesCritiques", alertesCritiques);
        m.put("caMois", caMois);
        m.put("evoCaMois", evo);
        return m;
    }

    public List<Map<String, Object>> ventesChart(String period) {
        int days = "week".equals(period) ? 7 : 30;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        List<Map<String, Object>> data = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate jour = today.minusDays(i);
            BigDecimal total = venteRepo.sumTotalBetween(jour.atStartOfDay(), jour.plusDays(1).atStartOfDay());
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("jour", jour.format(fmt));
            point.put("total", total != null ? total : BigDecimal.ZERO);
            data.add(point);
        }
        return data;
    }

    public List<Map<String, Object>> topMedicaments() {
        LocalDateTime startMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        List<Object[]> rows = ligneVenteRepo.topMedicaments(startMonth);
        List<Map<String, Object>> result = new ArrayList<>();
        int limit = Math.min(rows.size(), 10);
        for (int i = 0; i < limit; i++) {
            Object[] row = rows.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("nom", row[0]);
            m.put("ca", row[1]);
            result.add(m);
        }
        return result;
    }
}
