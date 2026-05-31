package com.pharmastock.controller;

import com.pharmastock.service.RapportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rapports")
public class RapportController {

    private final RapportService service;
    public RapportController(RapportService service) { this.service = service; }

    private ResponseEntity<byte[]> pdf(byte[] data, String name) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + name)
                .body(data);
    }

    @GetMapping("/stock")
    public ResponseEntity<byte[]> stock() { return pdf(service.rapportStock(), "rapport-stock.pdf"); }

    @GetMapping("/ventes")
    public ResponseEntity<byte[]> ventes() { return pdf(service.rapportVentes(), "rapport-ventes.pdf"); }

    @GetMapping("/peremptions")
    public ResponseEntity<byte[]> peremptions() { return pdf(service.rapportPeremptions(), "rapport-peremptions.pdf"); }

    @GetMapping("/mouvements")
    public ResponseEntity<byte[]> mouvements() { return pdf(service.rapportMouvements(), "rapport-mouvements.pdf"); }
}
