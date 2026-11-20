package cl.caso2.AranedaCarrasco.web.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MascotaRequest(
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Size(max = 60) String especie,
        @Size(max = 80) String raza,
        @NotNull @PastOrPresent LocalDate fechaNacimiento,
        @NotNull @Positive @Digits(integer = 4, fraction = 2) BigDecimal peso
) {
}
