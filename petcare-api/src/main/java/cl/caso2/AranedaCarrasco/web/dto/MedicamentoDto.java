package cl.caso2.AranedaCarrasco.web.dto;

public record MedicamentoDto(
        String id,
        String nombre,
        String principioActivo,
        String dosis
) {
}
