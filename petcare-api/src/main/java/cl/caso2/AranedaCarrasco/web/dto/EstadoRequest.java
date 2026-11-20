package cl.caso2.AranedaCarrasco.web.dto;

import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import jakarta.validation.constraints.NotNull;

public record EstadoRequest(
        @NotNull EstadoReserva estado
) {
}
