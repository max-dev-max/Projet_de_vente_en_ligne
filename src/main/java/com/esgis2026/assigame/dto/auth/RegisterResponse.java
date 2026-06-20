package com.esgis2026.assigame.dto.auth;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RegisterResponse {
    String message;
    UserResponse utilisateur;
}
