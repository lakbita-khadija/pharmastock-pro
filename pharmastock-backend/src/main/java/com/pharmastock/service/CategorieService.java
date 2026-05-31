package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.dto.CategorieRequest;
import com.pharmastock.entity.Categorie;
import com.pharmastock.repository.CategorieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategorieService {

    private final CategorieRepository repo;
    public CategorieService(CategorieRepository repo) { this.repo = repo; }

    public List<Map<String, Object>> getAll() {
        return repo.findAll().stream().map(Mapper::categorie).collect(Collectors.toList());
    }

    public Map<String, Object> create(CategorieRequest r) {
        Categorie c = Categorie.builder().nom(r.nom()).description(r.description()).build();
        return Mapper.categorie(repo.save(c));
    }

    public Map<String, Object> update(Long id, CategorieRequest r) {
        Categorie c = repo.findById(id).orElseThrow(() -> ApiException.notFound("Categorie introuvable."));
        c.setNom(r.nom());
        c.setDescription(r.description());
        return Mapper.categorie(repo.save(c));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw ApiException.notFound("Categorie introuvable.");
        repo.deleteById(id);
    }
}
