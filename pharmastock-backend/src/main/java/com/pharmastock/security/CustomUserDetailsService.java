package com.pharmastock.security;

import com.pharmastock.entity.Utilisateur;
import com.pharmastock.repository.UtilisateurRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository repo;

    public CustomUserDetailsService(UtilisateurRepository repo) { this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur u = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + email));
        return User.builder()
                .username(u.getEmail())
                .password(u.getMotDePasse())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name())))
                .disabled(!u.isActif())
                .build();
    }
}
