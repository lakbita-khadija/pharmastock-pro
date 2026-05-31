package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.service.StockService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class StockController {

    private final StockService service;
    public StockController(StockService service) { this.service = service; }

    @GetMapping("/stock")
    public ApiResponse getStock(@RequestParam(required = false) String q,
                                @RequestParam(required = false, name = "expFilter") String expFilter,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.of(service.getStock(q, expFilter, page, size));
    }

    @GetMapping("/stock/{medId}/mouvements")
    public ApiResponse mouvements(@PathVariable Long medId) {
        return ApiResponse.of(service.getMouvements(medId));
    }

    @GetMapping("/stock/{medId}/lots")
    public ApiResponse lotsByMed(@PathVariable Long medId) {
        return ApiResponse.of(service.getLots(medId));
    }

    @GetMapping("/lots")
    public ApiResponse allLots() {
        return ApiResponse.of(service.getAllLots());
    }

    @PutMapping("/lots/{id}/bloquer")
    public ApiResponse bloquer(@PathVariable Long id) {
        service.bloquerLot(id);
        return ApiResponse.of(Map.of("success", true));
    }

    @GetMapping("/lots/expiration")
    public ApiResponse byExpiry(@RequestParam(required = false) Integer jours) {
        return ApiResponse.of(service.getLotsByExpiry(jours));
    }
}
