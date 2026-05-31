package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.common.PageMapper;
import com.pharmastock.dto.MedicamentRequest;
import com.pharmastock.entity.Categorie;
import com.pharmastock.entity.Medicament;
import com.pharmastock.enums.StatutDispensation;
import com.pharmastock.repository.CategorieRepository;
import com.pharmastock.repository.MedicamentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicamentService {

    private final MedicamentRepository repo;
    private final CategorieRepository categorieRepo;
    private final AuditLogService audit;

    public MedicamentService(MedicamentRepository repo, CategorieRepository categorieRepo, AuditLogService audit) {
        this.repo = repo;
        this.categorieRepo = categorieRepo;
        this.audit = audit;
    }

    public Map<String, Object> getAll(String q, Long categorieId, int page, int size) {
        String query = (q == null) ? "" : q.trim();
        long cat = (categorieId == null) ? 0L : categorieId;
        var result = repo.search(query, cat,
                PageRequest.of(page, size, Sort.by("nomCommercial")));
        return PageMapper.of(result, Mapper::medicament);
    }

    public Map<String, Object> getById(Long id) {
        return Mapper.medicament(find(id));
    }

    public List<Map<String, Object>> quickSearch(String q) {
        if (q == null || q.isBlank()) return List.of();
        return repo.quickSearch(q, PageRequest.of(0, 15)).stream()
                .map(Mapper::medicament).collect(Collectors.toList());
    }

    public Map<String, Object> getByBarcode(String code) {
        return Mapper.medicament(repo.findByCodeBarre(code)
                .orElseThrow(() -> ApiException.notFound("Aucun medicament pour ce code-barres.")));
    }

    public Map<String, Object> create(MedicamentRequest r) {
        Medicament m = new Medicament();
        apply(m, r);
        m = repo.save(m);
        audit.log("CREATE", "Medicament", m.getNomCommercial());
        return Mapper.medicament(m);
    }

    public Map<String, Object> update(Long id, MedicamentRequest r) {
        Medicament m = find(id);
        apply(m, r);
        m = repo.save(m);
        audit.log("UPDATE", "Medicament", m.getNomCommercial());
        return Mapper.medicament(m);
    }

    /** Archivage logique (le frontend parle d'"archiver"). */
    public void delete(Long id) {
        Medicament m = find(id);
        m.setActif(false);
        repo.save(m);
        audit.log("ARCHIVE", "Medicament", m.getNomCommercial());
    }

    private void apply(Medicament m, MedicamentRequest r) {
        m.setNomCommercial(r.nomCommercial());
        m.setDci(r.dci());
        m.setCodeBarre(emptyToNull(r.codeBarre()));
        m.setFormegalenique(r.formegalenique());
        m.setDosage(r.dosage());
        m.setStatutDispensation(r.statutDispensation() != null ? r.statutDispensation() : StatutDispensation.LIBRE);
        m.setPrixAchatHt(r.prixAchatHt() != null ? r.prixAchatHt() : BigDecimal.ZERO);
        m.setPrixVenteTtc(r.prixVenteTtc() != null ? r.prixVenteTtc() : BigDecimal.ZERO);
        m.setSeuilMinimal(r.seuilMinimal() != null ? r.seuilMinimal() : 10);
        m.setActif(r.actif() == null || r.actif());
        if (r.categorieId() != null) {
            Categorie c = categorieRepo.findById(r.categorieId())
                    .orElseThrow(() -> ApiException.badRequest("Categorie invalide."));
            m.setCategorie(c);
        } else {
            m.setCategorie(null);
        }
    }

    private Medicament find(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Medicament introuvable."));
    }

    private String emptyToNull(String s) { return (s == null || s.isBlank()) ? null : s; }
}
