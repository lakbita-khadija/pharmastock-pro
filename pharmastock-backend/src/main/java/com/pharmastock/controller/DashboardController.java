package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService service;
    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping("/kpis")
    public ApiResponse kpis() { return ApiResponse.of(service.kpis()); }

    @GetMapping("/ventes-chart")
    public ApiResponse ventesChart(@RequestParam(required = false) String period) {
        return ApiResponse.of(service.ventesChart(period));
    }

    @GetMapping("/top-medicaments")
    public ApiResponse topMedicaments() { return ApiResponse.of(service.topMedicaments()); }
}
