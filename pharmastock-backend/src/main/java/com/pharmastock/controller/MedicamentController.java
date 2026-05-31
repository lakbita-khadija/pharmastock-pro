package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.MedicamentRequest;
import com.pharmastock.service.MedicamentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/medicaments")
public class MedicamentController {

    private final MedicamentService service;
    public MedicamentController(MedicamentService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String q,
                              @RequestParam(required = false) Long categorieId,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.of(service.getAll(q, categorieId, page, size));
    }

    @GetMapping("/search")
    public ApiResponse search(@RequestParam(required = false) String q) {
        return ApiResponse.of(service.quickSearch(q));
    }

    @GetMapping("/barcode/{code}")
    public ApiResponse byBarcode(@PathVariable String code) {
        return ApiResponse.of(service.getByBarcode(code));
    }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Long id) {
        return ApiResponse.of(service.getById(id));
    }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody MedicamentRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse update(@PathVariable Long id, @Valid @RequestBody MedicamentRequest req) {
        return ApiResponse.of(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.of(Map.of("success", true));
    }
}
