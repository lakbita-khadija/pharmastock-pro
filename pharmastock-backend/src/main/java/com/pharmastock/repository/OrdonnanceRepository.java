package com.pharmastock.repository;

import com.pharmastock.entity.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {
    @Query("SELECT o FROM Ordonnance o WHERE " +
           "LOWER(o.numeroOrdonnance) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(o.prescripteur) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY o.dateCreation DESC")
    List<Ordonnance> search(@Param("q") String q);
}
