package cl.caso2.AranedaCarrasco.web.dto;

public record NotificacionRequest(
        String destinatario,
        String tipoEvento,
        String mensaje
) {
}
