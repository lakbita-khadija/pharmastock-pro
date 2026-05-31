package com.pharmastock.repository;

import com.pharmastock.entity.Vente;
import com.pharmastock.enums.VenteStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface VenteRepository extends JpaRepository<Vente, Long> {

    @Query("SELECT v FROM Vente v WHERE " +
           "LOWER(v.numeroVente) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "AND v.dateVente >= :from AND v.dateVente <= :to " +
           "ORDER BY v.dateVente DESC")
    Page<Vente> search(@Param("q") String q,
                       @Param("from") LocalDateTime from,
                       @Param("to") LocalDateTime to,
                       Pageable pageable);

    @Query("SELECT COALESCE(SUM(v.totalTtc), 0) FROM Vente v WHERE v.statut = com.pharmastock.enums.VenteStatut.VALIDEE " +
           "AND v.dateVente >= :from AND v.dateVente < :to")
    BigDecimal sumTotalBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(v) FROM Vente v WHERE v.statut = com.pharmastock.enums.VenteStatut.VALIDEE " +
           "AND v.dateVente >= :from AND v.dateVente < :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<Vente> findByStatutAndDateVenteBetween(VenteStatut statut, LocalDateTime from, LocalDateTime to);
}
