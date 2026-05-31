package com.pharmastock.controller;

import com.pharmastock.common.ApiResponse;
import com.pharmastock.dto.ChangePasswordRequest;
import com.pharmastock.dto.LoginRequest;
import com.pharmastock.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    // IMPORTANT : login renvoie l'objet BRUT { token, refreshToken, user }
    // (le frontend lit data.token / data.user directement, sans enveloppe).
    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req.email(), req.password());
    }

    @PostMapping("/refresh")
    public ApiResponse refresh() {
        return ApiResponse.of(authService.refresh());
    }

    @PutMapping("/password")
    public ApiResponse changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(req.ancienMotDePasse(), req.nouveauMotDePasse());
        return ApiResponse.of(Map.of("success", true));
    }
}
