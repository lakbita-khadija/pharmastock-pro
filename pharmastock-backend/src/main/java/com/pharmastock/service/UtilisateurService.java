package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.dto.UtilisateurRequest;
import com.pharmastock.entity.Utilisateur;
import com.pharmastock.enums.Role;
import com.pharmastock.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UtilisateurService {

    private final UtilisateurRepository repo;
    private final PasswordEncoder encoder;
    private final AuditLogService audit;

    public UtilisateurService(UtilisateurRepository repo, PasswordEncoder encoder, AuditLogService audit) {
        this.repo = repo;
        this.encoder = encoder;
        this.audit = audit;
    }

    public List<Map<String, Object>> getAll() {
        return repo.findAll().stream().map(Mapper::user).collect(Collectors.toList());
    }

    public Map<String, Object> getById(Long id) {
        return Mapper.user(find(id));
    }

    public Map<String, Object> create(UtilisateurRequest r) {
        if (repo.existsByEmail(r.email())) {
            throw ApiException.badRequest("Un compte existe deja avec cet email.");
        }
        if (r.motDePasse() == null || r.motDePasse().isBlank()) {
            throw ApiException.badRequest("Le mot de passe est obligatoire.");
        }
        Utilisateur u = Utilisateur.builder()
                .nom(r.nom()).prenom(r.prenom()).email(r.email())
                .motDePasse(encoder.encode(r.motDePasse()))
                .role(r.role() != null ? r.role() : Role.CAISSIER)
                .actif(r.actif() == null || r.actif())
                .tentativesEchec(0)
                .build();
        u = repo.save(u);
        audit.log("CREATE", "Utilisateur", u.getEmail());
        return Mapper.user(u);
    }

    public Map<String, Object> update(Long id, UtilisateurRequest r) {
        Utilisateur u = find(id);
        u.setNom(r.nom());
        u.setPrenom(r.prenom());
        u.setEmail(r.email());
        if (r.role() != null) u.setRole(r.role());
        if (r.actif() != null) u.setActif(r.actif());
        if (r.motDePasse() != null && !r.motDePasse().isBlank()) {
            u.setMotDePasse(encoder.encode(r.motDePasse()));
        }
        u = repo.save(u);
        audit.log("UPDATE", "Utilisateur", u.getEmail());
        return Mapper.user(u);
    }

    public void deverrouiller(Long id) {
        Utilisateur u = find(id);
        u.setTentativesEchec(0);
        u.setActif(true);
        repo.save(u);
        audit.log("DEVERROUILLAGE", "Utilisateur", u.getEmail());
    }

    public void desactiver(Long id) {
        Utilisateur u = find(id);
        u.setActif(false);
        repo.save(u);
        audit.log("DESACTIVATION", "Utilisateur", u.getEmail());
    }

    private Utilisateur find(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Utilisateur introuvable."));
    }
}
