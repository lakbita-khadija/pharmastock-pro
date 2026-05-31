package com.pharmastock.repository;

import com.pharmastock.entity.Medicament;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MedicamentRepository extends JpaRepository<Medicament, Long> {

    Optional<Medicament> findByCodeBarre(String codeBarre);

    @Query("SELECT m FROM Medicament m WHERE " +
           "(LOWER(m.nomCommercial) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(m.dci) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(COALESCE(m.codeBarre, '')) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:categorieId = 0 OR m.categorie.id = :categorieId)")
    Page<Medicament> search(@Param("q") String q,
                            @Param("categorieId") Long categorieId,
                            Pageable pageable);

    @Query("SELECT m FROM Medicament m WHERE m.actif = true AND " +
           "(LOWER(m.nomCommercial) LIKE LOWER(CONCAT('%', :q, '%')) " +
           " OR LOWER(m.dci) LIKE LOWER(CONCAT('%', :q, '%')) " +
           " OR m.codeBarre LIKE CONCAT('%', :q, '%'))")
    List<Medicament> quickSearch(@Param("q") String q, Pageable pageable);
}
