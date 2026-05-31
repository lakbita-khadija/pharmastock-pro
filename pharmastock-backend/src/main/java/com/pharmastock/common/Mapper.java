package com.pharmastock.common;

import com.pharmastock.entity.*;
import com.pharmastock.repository.LotRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Convertit les entites en Map (cles = noms de champs exacts attendus par le frontend).
 * On ne serialise jamais les entites directement -> aucune boucle Jackson possible.
 */
public final class Mapper {

    private Mapper() {}

    private static Map<String, Object> map() { return new LinkedHashMap<>(); }

    // ---- Utilisateur ----
    public static Map<String, Object> userBrief(Utilisateur u) {
        if (u == null) return null;
        Map<String, Object> m = map();
        m.put("id", u.getId());
        m.put("nom", u.getNom());
        m.put("prenom", u.getPrenom());
        m.put("email", u.getEmail());
        m.put("role", u.getRole());
        return m;
    }

    public static Map<String, Object> user(Utilisateur u) {
        if (u == null) return null;
        Map<String, Object> m = userBrief(u);
        m.put("derniereConnexion", u.getDerniereConnexion());
        m.put("tentativesEchec", u.getTentativesEchec());
        m.put("actif", u.isActif());
        m.put("dateCreation", u.getDateCreation());
        return m;
    }

    // ---- Categorie ----
    public static Map<String, Object> categorie(Categorie c) {
        if (c == null) return null;
        Map<String, Object> m = map();
        m.put("id", c.getId());
        m.put("nom", c.getNom());
        m.put("description", c.getDescription());
        return m;
    }

    // ---- Fournisseur ----
    public static Map<String, Object> fournisseur(Fournisseur f) {
        if (f == null) return null;
        Map<String, Object> m = map();
        m.put("id", f.getId());
        m.put("nom", f.getNom());
        m.put("raisonSociale", f.getRaisonSociale());
        m.put("telephone", f.getTelephone());
        m.put("email", f.getEmail());
        m.put("adresse", f.getAdresse());
        m.put("ville", f.getVille());
        m.put("delaiLivraisonJours", f.getDelaiLivraisonJours());
        m.put("actif", f.isActif());
        return m;
    }

    // ---- Medicament ----
    public static Map<String, Object> medicament(Medicament med) {
        if (med == null) return null;
        Map<String, Object> m = map();
        m.put("id", med.getId());
        m.put("nomCommercial", med.getNomCommercial());
        m.put("dci", med.getDci());
        m.put("codeBarre", med.getCodeBarre());
        m.put("formegalenique", med.getFormegalenique());
        m.put("dosage", med.getDosage());
        m.put("categorie", categorie(med.getCategorie()));
        m.put("statutDispensation", med.getStatutDispensation());
        m.put("prixAchatHt", med.getPrixAchatHt());
        m.put("prixVenteTtc", med.getPrixVenteTtc());
        m.put("seuilMinimal", med.getSeuilMinimal());
        m.put("actif", med.isActif());
        return m;
    }

    // ---- Lot ----
    public static Map<String, Object> lot(Lot l) {
        if (l == null) return null;
        Map<String, Object> m = map();
        m.put("id", l.getId());
        m.put("numeroLot", l.getNumeroLot());
        m.put("quantiteDisponible", l.getQuantiteDisponible());
        m.put("dateExpiration", l.getDateExpiration());
        m.put("statut", l.getStatut());
        return m;
    }

    // ---- Mouvement ----
    public static Map<String, Object> mouvement(MouvementStock mv) {
        Map<String, Object> m = map();
        m.put("id", mv.getId());
        m.put("typeOperation", mv.getTypeOperation());
        m.put("quantite", mv.getQuantite());
        m.put("utilisateur", userBrief(mv.getUtilisateur()));
        m.put("dateOperation", mv.getDateOperation());
        Map<String, Object> lotRef = null;
        if (mv.getLot() != null) {
            lotRef = map();
            lotRef.put("numeroLot", mv.getLot().getNumeroLot());
        }
        m.put("lot", lotRef);
        m.put("commentaire", mv.getCommentaire());
        return m;
    }

    // ---- Vente (liste) ----
    public static Map<String, Object> venteListe(Vente v) {
        Map<String, Object> m = map();
        m.put("id", v.getId());
        m.put("numeroVente", v.getNumeroVente());
        m.put("dateVente", v.getDateVente());
        m.put("nbArticles", v.getLignes() != null ? v.getLignes().size() : 0);
        m.put("totalTtc", v.getTotalTtc());
        m.put("modePaiement", v.getModePaiement());
        m.put("caissier", userBrief(v.getCaissier()));
        m.put("statut", v.getStatut());
        return m;
    }

    // ---- Vente (detail apres creation) ----
    public static Map<String, Object> venteDetail(Vente v) {
        Map<String, Object> m = venteListe(v);
        m.put("montantDonne", v.getMontantDonne());
        java.util.List<Map<String, Object>> lignes = new java.util.ArrayList<>();
        if (v.getLignes() != null) {
            for (LigneVente lv : v.getLignes()) {
                Map<String, Object> lm = map();
                lm.put("id", lv.getId());
                lm.put("medicament", medicament(lv.getMedicament()));
                lm.put("quantite", lv.getQuantite());
                lm.put("prixUnitaire", lv.getPrixUnitaire());
                lm.put("remise", lv.getRemise());
                lm.put("sousTotal", lv.getSousTotal());
                lignes.add(lm);
            }
        }
        m.put("lignes", lignes);
        return m;
    }

    // ---- Commande ----
    public static Map<String, Object> commande(CommandeFournisseur c) {
        Map<String, Object> m = map();
        m.put("id", c.getId());
        m.put("numeroCommande", c.getNumeroCommande());
        Map<String, Object> four = null;
        if (c.getFournisseur() != null) {
            four = map();
            four.put("id", c.getFournisseur().getId());
            four.put("nom", c.getFournisseur().getNom());
        }
        m.put("fournisseur", four);
        m.put("dateCreation", c.getDateCreation());
        m.put("nbLignes", c.getLignes() != null ? c.getLignes().size() : 0);
        m.put("montantTotal", c.getMontantTotal());
        m.put("statut", c.getStatut());
        java.util.List<Map<String, Object>> lignes = new java.util.ArrayList<>();
        if (c.getLignes() != null) {
            for (LigneCommande lc : c.getLignes()) {
                Map<String, Object> lm = map();
                lm.put("id", lc.getId());
                Map<String, Object> medRef = null;
                if (lc.getMedicament() != null) {
                    medRef = map();
                    medRef.put("id", lc.getMedicament().getId());
                    medRef.put("nomCommercial", lc.getMedicament().getNomCommercial());
                }
                lm.put("medicament", medRef);
                lm.put("quantiteCommandee", lc.getQuantiteCommandee());
                lm.put("quantiteRecue", lc.getQuantiteRecue());
                lm.put("prixUnitaire", lc.getPrixUnitaire());
                lignes.add(lm);
            }
        }
        m.put("lignes", lignes);
        return m;
    }

    // ---- Alerte ----
    public static Map<String, Object> alerte(AlerteStock a) {
        Map<String, Object> m = map();
        m.put("id", a.getId());
        m.put("niveau", a.getNiveau());
        m.put("typeAlerte", a.getTypeAlerte());
        Map<String, Object> medRef = null;
        if (a.getMedicament() != null) {
            medRef = map();
            medRef.put("id", a.getMedicament().getId());
            medRef.put("nomCommercial", a.getMedicament().getNomCommercial());
        }
        m.put("medicament", medRef);
        m.put("message", a.getMessage());
        m.put("dateCreation", a.getDateCreation());
        m.put("statut", a.getStatut());
        m.put("acquittePar", userBrief(a.getAcquittePar()));
        return m;
    }

    // ---- Ordonnance ----
    public static Map<String, Object> ordonnance(Ordonnance o) {
        Map<String, Object> m = map();
        m.put("id", o.getId());
        m.put("numeroOrdonnance", o.getNumeroOrdonnance());
        m.put("prescripteur", o.getPrescripteur());
        m.put("patient", o.getPatient());
        m.put("datePrescription", o.getDatePrescription());
        m.put("dateValidite", o.getDateValidite());
        m.put("statut", o.getStatut());
        return m;
    }

    // ---- Audit ----
    public static Map<String, Object> auditLog(AuditLog a) {
        Map<String, Object> m = map();
        m.put("id", a.getId());
        m.put("utilisateur", userBrief(a.getUtilisateur()));
        m.put("action", a.getAction());
        m.put("entite", a.getEntite());
        m.put("details", a.getDetails());
        m.put("nouvelleValeur", a.getDetails());
        m.put("adresseIp", a.getAdresseIp());
        m.put("dateAction", a.getDateAction());
        m.put("timestamp", a.getDateAction());
        return m;
    }

    // ---- Inventaire ----
    public static Map<String, Object> inventaire(Inventaire inv) {
        Map<String, Object> m = map();
        m.put("id", inv.getId());
        m.put("type", inv.getType());
        m.put("dateDebut", inv.getDateDebut());
        m.put("dateCreation", inv.getDateDebut());
        m.put("dateValidation", inv.getDateValidation());
        m.put("statut", inv.getStatut());
        return m;
    }
}
