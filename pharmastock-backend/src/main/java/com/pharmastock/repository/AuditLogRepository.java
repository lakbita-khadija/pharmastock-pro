package com.pharmastock.repository;

import com.pharmastock.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Query("SELECT a FROM AuditLog a WHERE " +
           "a.dateAction >= :from AND a.dateAction <= :to " +
           "ORDER BY a.dateAction DESC")
    Page<AuditLog> search(@Param("from") LocalDateTime from,
                          @Param("to") LocalDateTime to,
                          Pageable pageable);
}
