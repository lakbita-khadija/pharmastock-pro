package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.ReceptionRequest;
import com.pharmastock.service.CommandeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/receptions")
public class ReceptionController {

    private final CommandeService service;
    public ReceptionController(CommandeService service) { this.service = service; }

    @PostMapping
    public ApiResponse receptionner(@Valid @RequestBody ReceptionRequest req) {
        return ApiResponse.of(service.receptionner(req));
    }
}
