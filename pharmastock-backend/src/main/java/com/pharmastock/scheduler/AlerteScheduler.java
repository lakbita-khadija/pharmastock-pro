package com.pharmastock.scheduler;

import com.pharmastock.service.AlerteService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlerteScheduler {

    private final AlerteService alerteService;
    public AlerteScheduler(AlerteService alerteService) { this.alerteService = alerteService; }

    /** Tous les jours a 01h00 : verifie peremptions et seuils. */
    @Scheduled(cron = "0 0 1 * * *")
    public void verificationQuotidienne() {
        alerteService.verifierPeremptions();
        alerteService.verifierSeuils();
    }
}
