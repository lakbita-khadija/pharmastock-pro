package com.pharmastock.repository;

import com.pharmastock.entity.AlerteStock;
import com.pharmastock.enums.AlerteStatut;
import com.pharmastock.enums.AlerteType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlerteStockRepository extends JpaRepository<AlerteStock, Long> {

    List<AlerteStock> findAllByOrderByDateCreationDesc();

    long countByStatut(AlerteStatut statut);

    long countByStatutAndNiveau(AlerteStatut statut, com.pharmastock.enums.AlerteNiveau niveau);

    boolean existsByMedicamentIdAndTypeAlerteAndStatut(Long medId, AlerteType type, AlerteStatut statut);

    boolean existsByLotIdAndTypeAlerteAndStatut(Long lotId, AlerteType type, AlerteStatut statut);
}
