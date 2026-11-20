package cl.caso2.AranedaCarrasco.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtencionRequest(
        @NotNull Long reservaId,
        @NotBlank @Size(max = 500) String diagnostico,
        @NotBlank @Size(max = 500) String tratamiento,
        @Size(max = 500) String medicamentos
) {
}
