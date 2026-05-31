package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.AcquitterRequest;
import com.pharmastock.service.AlerteService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/alertes")
public class AlerteController {

    private final AlerteService service;
    public AlerteController(AlerteService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String statut,
                              @RequestParam(required = false) String niveau,
                              @RequestParam(required = false) Integer size) {
        return ApiResponse.of(service.getAll(statut, niveau, size));
    }

    @GetMapping("/count")
    public ApiResponse count() { return ApiResponse.of(service.count()); }

    @PutMapping("/{id}/acquitter")
    public ApiResponse acquitter(@PathVariable Long id, @RequestBody(required = false) AcquitterRequest req) {
        service.acquitter(id, req != null ? req.commentaire() : null);
        return ApiResponse.of(Map.of("success", true));
    }
}
