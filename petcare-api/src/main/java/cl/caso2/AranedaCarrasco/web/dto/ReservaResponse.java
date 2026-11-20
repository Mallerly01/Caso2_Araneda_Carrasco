package cl.caso2.AranedaCarrasco.web.dto;

import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import cl.caso2.AranedaCarrasco.domain.Reserva;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaResponse(
        Long id,
        Long mascotaId,
        String mascotaNombre,
        Long clienteId,
        String clienteNombre,
        String clienteEmail,
        Long veterinarioId,
        String veterinarioNombre,
        LocalDate fecha,
        LocalTime hora,
        EstadoReserva estado
) {
    public static ReservaResponse from(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getMascota().getId(),
                reserva.getMascota().getNombre(),
                reserva.getMascota().getCliente().getId(),
                reserva.getMascota().getCliente().getNombre(),
                reserva.getMascota().getCliente().getEmail(),
                reserva.getVeterinario().getId(),
                reserva.getVeterinario().getNombre(),
                reserva.getFecha(),
                reserva.getHora(),
                reserva.getEstado()
        );
    }
}
