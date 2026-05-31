package com.pharmastock.service;

import com.pharmastock.common.Mapper;
import com.pharmastock.common.PageMapper;
import com.pharmastock.common.SimplePdf;
import com.pharmastock.entity.AuditLog;
import com.pharmastock.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogRepository repo;
    private final CurrentUserService currentUser;

    public AuditLogService(AuditLogRepository repo, CurrentUserService currentUser) {
        this.repo = repo;
        this.currentUser = currentUser;
    }

    public void log(String action, String entite, String details) {
        AuditLog l = AuditLog.builder()
                .utilisateur(currentUser.get())
                .action(action)
                .entite(entite)
                .details(details)
                .build();
        repo.save(l);
    }

    public Map<String, Object> search(String dateFrom, String dateTo, int page, int size) {
        LocalDateTime from = parseStart(dateFrom);
        LocalDateTime to = parseEnd(dateTo);
        Page<AuditLog> result = repo.search(from, to, PageRequest.of(page, size));
        return PageMapper.of(result, Mapper::auditLog);
    }

    public byte[] export(String dateFrom, String dateTo) {
        Page<AuditLog> result = repo.search(parseStart(dateFrom), parseEnd(dateTo),
                PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "dateAction")));
        DateTimeFormatter dt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        StringBuilder sb = new StringBuilder();
        sb.append("Date,Utilisateur,Action,Entite,Detail,Adresse IP\n");
        for (AuditLog a : result.getContent()) {
            String user = a.getUtilisateur() != null
                    ? a.getUtilisateur().getPrenom() + " " + a.getUtilisateur().getNom() : "Systeme";
            sb.append(csv(a.getDateAction().format(dt))).append(",")
              .append(csv(user)).append(",")
              .append(csv(a.getAction())).append(",")
              .append(csv(a.getEntite())).append(",")
              .append(csv(a.getDetails())).append(",")
              .append(csv(a.getAdresseIp())).append("\n");
        }
        // BOM UTF-8 pour que les accents s'affichent correctement dans Excel
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] body = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] out = new byte[bom.length + body.length];
        System.arraycopy(bom, 0, out, 0, bom.length);
        System.arraycopy(body, 0, out, bom.length, body.length);
        return out;
    }

    private String csv(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }

    private LocalDateTime parseStart(String d) {
        if (d == null || d.isBlank()) return LocalDateTime.of(1900, 1, 1, 0, 0);
        return LocalDate.parse(d).atStartOfDay();
    }
    private LocalDateTime parseEnd(String d) {
        if (d == null || d.isBlank()) return LocalDateTime.of(2999, 12, 31, 23, 59, 59);
        return LocalDate.parse(d).atTime(LocalTime.MAX);
    }
}
