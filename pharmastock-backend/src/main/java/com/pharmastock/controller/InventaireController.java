package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.InventaireRequest;
import com.pharmastock.dto.InventaireSaisieRequest;
import com.pharmastock.service.InventaireService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventaires")
public class InventaireController {

    private final InventaireService service;
    public InventaireController(InventaireService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll() { return ApiResponse.of(service.getAll()); }

    @PostMapping
    public ApiResponse demarrer(@RequestBody(required = false) InventaireRequest req) {
        return ApiResponse.of(service.demarrer(req));
    }

    @PutMapping("/{id}/lignes")
    public ApiResponse saisir(@PathVariable Long id, @RequestBody(required = false) InventaireSaisieRequest req) {
        return ApiResponse.of(service.saisir(id, req));
    }

    @PutMapping("/{id}/valider")
    public ApiResponse valider(@PathVariable Long id) {
        return ApiResponse.of(service.valider(id));
    }

    @GetMapping("/{id}/ecarts")
    public ApiResponse ecarts(@PathVariable Long id) {
        return ApiResponse.of(service.ecarts(id));
    }
}
