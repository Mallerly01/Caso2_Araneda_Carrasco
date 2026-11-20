package cl.caso2.AranedaCarrasco.web.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequest(
        @NotNull Long mascotaId,
        @NotNull Long veterinarioId,
        @NotNull @FutureOrPresent LocalDate fecha,
        @NotNull LocalTime hora
) {
}
