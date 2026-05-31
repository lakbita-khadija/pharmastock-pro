package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.dto.InventaireRequest;
import com.pharmastock.dto.InventaireSaisieRequest;
import com.pharmastock.entity.Inventaire;
import com.pharmastock.entity.LigneInventaire;
import com.pharmastock.entity.Medicament;
import com.pharmastock.enums.InventaireStatut;
import com.pharmastock.repository.InventaireRepository;
import com.pharmastock.repository.LigneInventaireRepository;
import com.pharmastock.repository.MedicamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InventaireService {

    private final InventaireRepository repo;
    private final LigneInventaireRepository ligneRepo;
    private final MedicamentRepository medicamentRepo;
    private final StockService stockService;
    private final CurrentUserService currentUser;

    public InventaireService(InventaireRepository repo, LigneInventaireRepository ligneRepo,
                             MedicamentRepository medicamentRepo, StockService stockService,
                             CurrentUserService currentUser) {
        this.repo = repo;
        this.ligneRepo = ligneRepo;
        this.medicamentRepo = medicamentRepo;
        this.stockService = stockService;
        this.currentUser = currentUser;
    }

    public List<Map<String, Object>> getAll() {
        return repo.findAllByOrderByDateDebutDesc().stream().map(Mapper::inventaire).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> demarrer(InventaireRequest r) {
        Inventaire inv = Inventaire.builder()
                .type(r != null && r.type() != null ? r.type() : "Total")
                .statut(InventaireStatut.EN_COURS)
                .creePar(currentUser.get())
                .build();
        // snapshot des quantites theoriques
        List<LigneInventaire> lignes = new ArrayList<>();
        for (Medicament m : medicamentRepo.findAll()) {
            if (!m.isActif()) continue;
            int theorique = stockService.stockTotalActif(m.getId());
            lignes.add(LigneInventaire.builder()
                    .inventaire(inv).medicament(m)
                    .quantiteTheorique(theorique).quantitePhysique(null).ecart(0).build());
        }
        inv.setLignes(lignes);
        return Mapper.inventaire(repo.save(inv));
    }

    @Transactional
    public Map<String, Object> saisir(Long id, InventaireSaisieRequest req) {
        Inventaire inv = find(id);
        if (inv.getStatut() != InventaireStatut.EN_COURS) {
            throw ApiException.badRequest("Inventaire deja valide.");
        }
        if (req != null && req.lignes() != null) {
            for (InventaireSaisieRequest.Ligne l : req.lignes()) {
                inv.getLignes().stream()
                        .filter(x -> x.getMedicament().getId().equals(l.medicamentId()))
                        .findFirst().ifPresent(li -> {
                            li.setQuantitePhysique(l.quantitePhysique());
                            li.setEcart((l.quantitePhysique() != null ? l.quantitePhysique() : 0)
                                    - li.getQuantiteTheorique());
                        });
            }
        }
        return Mapper.inventaire(repo.save(inv));
    }

    @Transactional
    public Map<String, Object> valider(Long id) {
        Inventaire inv = find(id);
        inv.setStatut(InventaireStatut.VALIDE);
        inv.setDateValidation(LocalDateTime.now());
        return Mapper.inventaire(repo.save(inv));
    }

    public List<Map<String, Object>> ecarts(Long id) {
        Inventaire inv = find(id);
        List<Map<String, Object>> result = new ArrayList<>();
        for (LigneInventaire l : inv.getLignes()) {
            if (l.getEcart() != null && l.getEcart() != 0) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("medicament", l.getMedicament().getNomCommercial());
                m.put("quantiteTheorique", l.getQuantiteTheorique());
                m.put("quantitePhysique", l.getQuantitePhysique());
                m.put("ecart", l.getEcart());
                result.add(m);
            }
        }
        return result;
    }

    private Inventaire find(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Inventaire introuvable."));
    }
}
