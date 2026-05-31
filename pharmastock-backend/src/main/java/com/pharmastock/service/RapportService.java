package com.pharmastock.service;

import com.pharmastock.common.SimplePdf;
import com.pharmastock.entity.Lot;
import com.pharmastock.entity.Medicament;
import com.pharmastock.entity.MouvementStock;
import com.pharmastock.entity.Vente;
import com.pharmastock.repository.LotRepository;
import com.pharmastock.repository.MedicamentRepository;
import com.pharmastock.repository.MouvementStockRepository;
import com.pharmastock.repository.VenteRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class RapportService {

    private final MedicamentRepository medicamentRepo;
    private final LotRepository lotRepo;
    private final VenteRepository venteRepo;
    private final MouvementStockRepository mouvementRepo;
    private final StockService stockService;

    private static final DateTimeFormatter D  = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public RapportService(MedicamentRepository medicamentRepo, LotRepository lotRepo, VenteRepository venteRepo,
                          MouvementStockRepository mouvementRepo, StockService stockService) {
        this.medicamentRepo = medicamentRepo;
        this.lotRepo = lotRepo;
        this.venteRepo = venteRepo;
        this.mouvementRepo = mouvementRepo;
        this.stockService = stockService;
    }

    private String dateLine() {
        return "Genere le " + LocalDate.now().format(D) + "  -  PharmaStock Pro";
    }

    public byte[] rapportStock() {
        String[] headers = {"Medicament", "DCI", "Stock", "Seuil", "Statut"};
        int[] colW = {150, 150, 60, 60, 85};
        List<String[]> rows = new ArrayList<>();
        for (Medicament m : medicamentRepo.findAll()) {
            if (!m.isActif()) continue;
            int stock = stockService.stockTotalActif(m.getId());
            String statut = stock == 0 ? "Rupture" : (stock <= m.getSeuilMinimal() ? "Stock faible" : "OK");
            rows.add(new String[]{
                    m.getNomCommercial(), m.getDci(),
                    String.valueOf(stock), String.valueOf(m.getSeuilMinimal()), statut
            });
        }
        return SimplePdf.report("RAPPORT DE STOCK", dateLine(), headers, colW, rows);
    }

    public byte[] rapportVentes() {
        String[] headers = {"N. Vente", "Date / Heure", "Total TTC", "Paiement", "Statut"};
        int[] colW = {120, 130, 90, 90, 75};
        List<String[]> rows = new ArrayList<>();
        var ventes = venteRepo.findAll(PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "dateVente")));
        for (Vente v : ventes) {
            rows.add(new String[]{
                    v.getNumeroVente(), v.getDateVente().format(DT),
                    v.getTotalTtc() + " DH", String.valueOf(v.getModePaiement()), String.valueOf(v.getStatut())
            });
        }
        return SimplePdf.report("RAPPORT DES VENTES", dateLine(), headers, colW, rows);
    }

    public byte[] rapportPeremptions() {
        String[] headers = {"Medicament", "N. Lot", "Expiration", "Quantite"};
        int[] colW = {190, 130, 110, 75};
        List<String[]> rows = new ArrayList<>();
        for (Lot lot : lotRepo.findExpiringBefore(LocalDate.now().plusDays(90))) {
            rows.add(new String[]{
                    lot.getMedicament().getNomCommercial(), lot.getNumeroLot(),
                    lot.getDateExpiration().format(D), String.valueOf(lot.getQuantiteDisponible())
            });
        }
        return SimplePdf.report("RAPPORT DES PEREMPTIONS (90 jours)", dateLine(), headers, colW, rows);
    }

    public byte[] rapportMouvements() {
        String[] headers = {"Date / Heure", "Type", "Medicament", "Quantite"};
        int[] colW = {130, 90, 210, 75};
        List<String[]> rows = new ArrayList<>();
        var mvs = mouvementRepo.findAll(PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "dateOperation")));
        for (MouvementStock mv : mvs) {
            rows.add(new String[]{
                    mv.getDateOperation().format(DT), String.valueOf(mv.getTypeOperation()),
                    mv.getMedicament() != null ? mv.getMedicament().getNomCommercial() : "",
                    String.valueOf(mv.getQuantite())
            });
        }
        return SimplePdf.report("RAPPORT DES MOUVEMENTS", dateLine(), headers, colW, rows);
    }
}
