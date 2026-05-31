package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.service.AuditLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditLogService service;
    public AuditController(AuditLogService service) { this.service = service; }

    @GetMapping
    public ApiResponse getAll(@RequestParam(required = false) String dateFrom,
                              @RequestParam(required = false) String dateTo,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "25") int size) {
        return ApiResponse.of(service.search(dateFrom, dateTo, page, size));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String dateFrom,
                                         @RequestParam(required = false) String dateTo) {
        byte[] csv = service.export(dateFrom, dateTo);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit.csv")
                .body(csv);
    }
}
