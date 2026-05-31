package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.FournisseurRequest;
import com.pharmastock.service.FournisseurService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/fournisseurs")
public class FournisseurController {

    private final FournisseurService service;
    public FournisseurController(FournisseurService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String q,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.of(service.getAll(q, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Long id) { return ApiResponse.of(service.getById(id)); }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody FournisseurRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse update(@PathVariable Long id, @Valid @RequestBody FournisseurRequest req) {
        return ApiResponse.of(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        service.desactiver(id);
        return ApiResponse.of(Map.of("success", true));
    }
}
