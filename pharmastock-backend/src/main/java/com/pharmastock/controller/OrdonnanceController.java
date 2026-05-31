package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.OrdonnanceRequest;
import com.pharmastock.service.OrdonnanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ordonnances")
public class OrdonnanceController {

    private final OrdonnanceService service;
    public OrdonnanceController(OrdonnanceService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String q) {
        return ApiResponse.of(service.getAll(q));
    }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Long id) { return ApiResponse.of(service.getById(id)); }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody OrdonnanceRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @PutMapping("/{id}/valider")
    public ApiResponse valider(@PathVariable Long id) {
        return ApiResponse.of(service.valider(id));
    }
}
