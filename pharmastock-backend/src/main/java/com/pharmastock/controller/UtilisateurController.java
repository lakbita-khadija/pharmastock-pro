package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.UtilisateurRequest;
import com.pharmastock.service.UtilisateurService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/utilisateurs")
@PreAuthorize("hasRole('ADMIN')")
public class UtilisateurController {

    private final UtilisateurService service;
    public UtilisateurController(UtilisateurService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll() { return ApiResponse.of(service.getAll()); }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Long id) { return ApiResponse.of(service.getById(id)); }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody UtilisateurRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse update(@PathVariable Long id, @Valid @RequestBody UtilisateurRequest req) {
        return ApiResponse.of(service.update(id, req));
    }

    @PutMapping("/{id}/deverrouiller")
    public ApiResponse deverrouiller(@PathVariable Long id) {
        service.deverrouiller(id);
        return ApiResponse.of(Map.of("success", true));
    }

    @PutMapping("/{id}/desactiver")
    public ApiResponse desactiver(@PathVariable Long id) {
        service.desactiver(id);
        return ApiResponse.of(Map.of("success", true));
    }
}
