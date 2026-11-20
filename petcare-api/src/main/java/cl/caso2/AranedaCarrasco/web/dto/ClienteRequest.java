package cl.caso2.AranedaCarrasco.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank @Size(max = 120) String nombre,
        @Size(max = 30) String telefono,
        @NotBlank @Email @Size(max = 160) String email
) {
}
