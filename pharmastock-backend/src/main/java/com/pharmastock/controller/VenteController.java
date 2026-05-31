package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.AnnulerRequest;
import com.pharmastock.dto.VenteRequest;
import com.pharmastock.service.VenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ventes")
public class VenteController {

    private final VenteService service;
    public VenteController(VenteService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String q,
                              @RequestParam(required = false) String dateFrom,
                              @RequestParam(required = false) String dateTo,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.of(service.getAll(q, dateFrom, dateTo, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse getById(@PathVariable Long id) { return ApiResponse.of(service.getById(id)); }

    @PostMapping
    public ApiResponse create(@Valid @RequestBody VenteRequest req) {
        return ApiResponse.of(service.create(req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse annuler(@PathVariable Long id, @RequestBody(required = false) AnnulerRequest req) {
        service.annuler(id, req != null ? req.motif() : null);
        return ApiResponse.of(Map.of("success", true));
    }

    @GetMapping("/{id}/ticket")
    public ResponseEntity<byte[]> ticket(@PathVariable Long id) {
        byte[] pdf = service.genererTicket(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket-" + id + ".pdf")
                .body(pdf);
    }
}
