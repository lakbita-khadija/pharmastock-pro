package com.pharmastock.repository;

import com.pharmastock.entity.Inventaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventaireRepository extends JpaRepository<Inventaire, Long> {
    List<Inventaire> findAllByOrderByDateDebutDesc();
}
