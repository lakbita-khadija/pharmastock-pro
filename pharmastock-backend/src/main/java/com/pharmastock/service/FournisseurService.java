package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.common.PageMapper;
import com.pharmastock.dto.FournisseurRequest;
import com.pharmastock.entity.Fournisseur;
import com.pharmastock.repository.FournisseurRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FournisseurService {

    private final FournisseurRepository repo;
    public FournisseurService(FournisseurRepository repo) { this.repo = repo; }

    public Map<String, Object> getAll(String q, int page, int size) {
        String query = (q == null) ? "" : q.trim();
        var result = repo.search(query, PageRequest.of(page, size, Sort.by("nom")));
        return PageMapper.of(result, Mapper::fournisseur);
    }

    public Map<String, Object> getById(Long id) {
        return Mapper.fournisseur(repo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Fournisseur introuvable.")));
    }

    public Map<String, Object> create(FournisseurRequest r) {
        Fournisseur f = Fournisseur.builder()
                .nom(r.nom()).raisonSociale(r.raisonSociale()).telephone(r.telephone())
                .email(r.email()).adresse(r.adresse()).ville(r.ville())
                .delaiLivraisonJours(r.delaiLivraisonJours() != null ? r.delaiLivraisonJours() : 3)
                .actif(r.actif() == null || r.actif())
                .build();
        return Mapper.fournisseur(repo.save(f));
    }

    public Map<String, Object> update(Long id, FournisseurRequest r) {
        Fournisseur f = repo.findById(id).orElseThrow(() -> ApiException.notFound("Fournisseur introuvable."));
        f.setNom(r.nom());
        f.setRaisonSociale(r.raisonSociale());
        f.setTelephone(r.telephone());
        f.setEmail(r.email());
        f.setAdresse(r.adresse());
        f.setVille(r.ville());
        if (r.delaiLivraisonJours() != null) f.setDelaiLivraisonJours(r.delaiLivraisonJours());
        if (r.actif() != null) f.setActif(r.actif());
        return Mapper.fournisseur(repo.save(f));
    }

    public void desactiver(Long id) {
        Fournisseur f = repo.findById(id).orElseThrow(() -> ApiException.notFound("Fournisseur introuvable."));
        f.setActif(false);
        repo.save(f);
    }
}
