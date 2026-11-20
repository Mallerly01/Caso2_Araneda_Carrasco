package cl.caso2.AranedaCarrasco.web.dto;

public record NotificacionDto(
        String id,
        String destinatario,
        String tipoEvento,
        String mensaje,
        String fecha
) {
}
