package com.pharmastock.service;

import com.pharmastock.common.ApiException;
import com.pharmastock.common.Mapper;
import com.pharmastock.entity.Utilisateur;
import com.pharmastock.repository.UtilisateurRepository;
import com.pharmastock.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UtilisateurRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final CurrentUserService currentUser;
    private final AuditLogService audit;

    @Value("${app.security.max-tentatives}")
    private int maxTentatives;

    public AuthService(UtilisateurRepository repo, PasswordEncoder encoder, JwtUtil jwtUtil,
                       CurrentUserService currentUser, AuditLogService audit) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    /** Renvoie l'objet brut { token, refreshToken, user } (PAS encapsule dans data). */
    @Transactional
    public Map<String, Object> login(String email, String password) {
        Utilisateur u = repo.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Email ou mot de passe incorrect."));

        if (!u.isActif()) {
            throw ApiException.forbidden("Compte desactive. Contactez l'administrateur.");
        }
        if (u.getTentativesEchec() >= maxTentatives) {
            throw ApiException.forbidden("Compte verrouille apres trop de tentatives.");
        }

        if (!encoder.matches(password, u.getMotDePasse())) {
            u.setTentativesEchec(u.getTentativesEchec() + 1);
            repo.save(u);
            throw ApiException.unauthorized("Email ou mot de passe incorrect.");
        }

        // succes
        u.setTentativesEchec(0);
        u.setDerniereConnexion(LocalDateTime.now());
        repo.save(u);

        String token = jwtUtil.generateToken(u.getEmail(), u.getRole().name());
        String refresh = jwtUtil.generateRefreshToken(u.getEmail());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", token);
        body.put("refreshToken", refresh);
        body.put("user", Mapper.userBrief(u));
        return body;
    }

    @Transactional
    public void changePassword(String ancien, String nouveau) {
        Utilisateur u = currentUser.get();
        if (u == null) throw ApiException.unauthorized("Non authentifie.");
        if (!encoder.matches(ancien, u.getMotDePasse())) {
            throw ApiException.badRequest("Ancien mot de passe incorrect.");
        }
        u.setMotDePasse(encoder.encode(nouveau));
        repo.save(u);
        audit.log("CHANGE_PASSWORD", "Utilisateur", u.getEmail());
    }

    public Map<String, Object> refresh() {
        Utilisateur u = currentUser.get();
        if (u == null) throw ApiException.unauthorized("Non authentifie.");
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("token", jwtUtil.generateToken(u.getEmail(), u.getRole().name()));
        return m;
    }
}
