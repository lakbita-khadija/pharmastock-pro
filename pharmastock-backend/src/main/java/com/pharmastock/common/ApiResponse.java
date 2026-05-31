package com.pharmastock.common;

/**
 * Enveloppe standard de reponse. Le frontend lit toujours `response.data.data`,
 * donc chaque payload JSON est encapsule sous la cle "data".
 * (Seul /auth/login fait exception et renvoie l'objet brut.)
 */
public record ApiResponse(Object data) {
    public static ApiResponse of(Object data) { return new ApiResponse(data); }
}
