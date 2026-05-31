package com.pharmastock.service;

import com.pharmastock.entity.Utilisateur;
import com.pharmastock.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UtilisateurRepository repo;

    public CurrentUserService(UtilisateurRepository repo) { this.repo = repo; }

    /** Retourne l'utilisateur connecte, ou null si non authentifie. */
    public Utilisateur get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return repo.findByEmail(auth.getName()).orElse(null);
    }
}
