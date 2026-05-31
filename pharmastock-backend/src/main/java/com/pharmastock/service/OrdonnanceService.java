package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.dto.OrdonnanceRequest;
import com.pharmastock.entity.Ordonnance;
import com.pharmastock.enums.OrdonnanceStatut;
import com.pharmastock.repository.OrdonnanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrdonnanceService {

    private final OrdonnanceRepository repo;
    public OrdonnanceService(OrdonnanceRepository repo) { this.repo = repo; }

    public List<Map<String, Object>> getAll(String q) {
        return repo.search((q == null) ? "" : q.trim()).stream()
                .map(Mapper::ordonnance).collect(Collectors.toList());
    }

    public Map<String, Object> getById(Long id) {
        return Mapper.ordonnance(find(id));
    }

    public Map<String, Object> create(OrdonnanceRequest r) {
        Ordonnance o = Ordonnance.builder()
                .numeroOrdonnance(genererNumero())
                .prescripteur(r.prescripteur())
                .patient(r.patient())
                .datePrescription(r.datePrescription())
                .dateValidite(r.dateValidite())
                .statut(OrdonnanceStatut.EN_ATTENTE)
                .build();
        return Mapper.ordonnance(repo.save(o));
    }

    public Map<String, Object> valider(Long id) {
        Ordonnance o = find(id);
        o.setStatut(OrdonnanceStatut.VALIDEE);
        return Mapper.ordonnance(repo.save(o));
    }

    private String genererNumero() {
        String d = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long suffix = System.currentTimeMillis() % 100000;
        return "ORD-" + d + "-" + String.format("%05d", suffix);
    }

    private Ordonnance find(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Ordonnance introuvable."));
    }
}
