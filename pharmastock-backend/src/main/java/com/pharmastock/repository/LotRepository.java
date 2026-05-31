package com.pharmastock.repository;

import com.pharmastock.entity.Lot;
import com.pharmastock.enums.LotStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface LotRepository extends JpaRepository<Lot, Long> {

    List<Lot> findByMedicamentIdOrderByDateExpirationAsc(Long medicamentId);

    // FEFO : lots actifs avec stock, du plus proche perime au plus lointain
    @Query("SELECT l FROM Lot l WHERE l.medicament.id = :medId AND l.statut = com.pharmastock.enums.LotStatut.ACTIF " +
           "AND l.quantiteDisponible > 0 ORDER BY l.dateExpiration ASC")
    List<Lot> findFefoLots(@Param("medId") Long medId);

    List<Lot> findByStatut(LotStatut statut);

    @Query("SELECT l FROM Lot l WHERE l.statut = com.pharmastock.enums.LotStatut.ACTIF " +
           "AND l.quantiteDisponible > 0 AND l.dateExpiration <= :limite ORDER BY l.dateExpiration ASC")
    List<Lot> findExpiringBefore(@Param("limite") LocalDate limite);
}
