package com.pharmastock.repository;

import com.pharmastock.entity.LigneVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface LigneVenteRepository extends JpaRepository<LigneVente, Long> {

    // Top medicaments par CA sur une periode -> [nom, ca]
    @Query("SELECT lv.medicament.nomCommercial, SUM(lv.sousTotal) AS ca " +
           "FROM LigneVente lv WHERE lv.vente.statut = com.pharmastock.enums.VenteStatut.VALIDEE " +
           "AND lv.vente.dateVente >= :from " +
           "GROUP BY lv.medicament.id, lv.medicament.nomCommercial ORDER BY ca DESC")
    List<Object[]> topMedicaments(@Param("from") LocalDateTime from);
}
