package cl.caso2.AranedaCarrasco.web.dto;

import cl.caso2.AranedaCarrasco.domain.Mascota;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MascotaResponse(
        Long id,
        Long clienteId,
        String clienteNombre,
        String nombre,
        String especie,
        String raza,
        LocalDate fechaNacimiento,
        BigDecimal peso
) {
    public static MascotaResponse from(Mascota mascota) {
        return new MascotaResponse(
                mascota.getId(),
                mascota.getCliente().getId(),
                mascota.getCliente().getNombre(),
                mascota.getNombre(),
                mascota.getEspecie(),
                mascota.getRaza(),
                mascota.getFechaNacimiento(),
                mascota.getPeso()
        );
    }
}
