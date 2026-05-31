package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.CategorieRequest;
import com.pharmastock.service.CategorieService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/categories")
public class CategorieController {

    private final CategorieService service;
    public CategorieController(CategorieService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll() { return ApiResponse.of(service.getAll()); }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody CategorieRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse update(@PathVariable Long id, @Valid @RequestBody CategorieRequest req) {
        return ApiResponse.of(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.of(Map.of("success", true));
    }
}
