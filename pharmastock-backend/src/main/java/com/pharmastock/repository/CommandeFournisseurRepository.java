package com.pharmastock.repository;

import com.pharmastock.entity.CommandeFournisseur;
import com.pharmastock.enums.CommandeStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommandeFournisseurRepository extends JpaRepository<CommandeFournisseur, Long> {
    List<CommandeFournisseur> findByStatutOrderByDateCreationDesc(CommandeStatut statut);
    List<CommandeFournisseur> findAllByOrderByDateCreationDesc();
}
