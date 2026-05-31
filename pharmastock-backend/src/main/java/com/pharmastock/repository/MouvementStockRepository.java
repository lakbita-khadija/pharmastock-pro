package com.pharmastock.repository;

import com.pharmastock.entity.MouvementStock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {
    List<MouvementStock> findByMedicamentIdOrderByDateOperationDesc(Long medicamentId);
}
