package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.CommandeRequest;
import com.pharmastock.service.CommandeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/commandes")
public class CommandeController {

    private final CommandeService service;
    public CommandeController(CommandeService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String statut) {
        return ApiResponse.of(service.getAll(statut));
    }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Long id) { return ApiResponse.of(service.getById(id)); }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody CommandeRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @PutMapping("/{id}/envoyer")
    public ApiResponse envoyer(@PathVariable Long id) {
        service.envoyer(id);
        return ApiResponse.of(Map.of("success", true));
    }

    @PutMapping("/{id}/annuler")
    public ApiResponse annuler(@PathVariable Long id) {
        service.annuler(id);
        return ApiResponse.of(Map.of("success", true));
    }
}
