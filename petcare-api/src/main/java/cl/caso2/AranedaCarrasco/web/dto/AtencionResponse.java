package cl.caso2.AranedaCarrasco.web.dto;

import cl.caso2.AranedaCarrasco.domain.Atencion;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AtencionResponse(
        Long id,
        Long reservaId,
        Long mascotaId,
        String mascotaNombre,
        LocalDate fecha,
        LocalTime hora,
        String diagnostico,
        String tratamiento,
        String medicamentos,
        LocalDateTime fechaRegistro
) {
    public static AtencionResponse from(Atencion atencion) {
        return new AtencionResponse(
                atencion.getId(),
                atencion.getReserva().getId(),
                atencion.getReserva().getMascota().getId(),
                atencion.getReserva().getMascota().getNombre(),
                atencion.getReserva().getFecha(),
                atencion.getReserva().getHora(),
                atencion.getDiagnostico(),
                atencion.getTratamiento(),
                atencion.getMedicamentos(),
                atencion.getFechaRegistro()
        );
    }
}
