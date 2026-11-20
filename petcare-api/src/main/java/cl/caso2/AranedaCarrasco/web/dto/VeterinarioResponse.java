package cl.caso2.AranedaCarrasco.web.dto;

import cl.caso2.AranedaCarrasco.domain.Veterinario;

public record VeterinarioResponse(
        Long id,
        String nombre,
        String especialidad
) {
    public static VeterinarioResponse from(Veterinario veterinario) {
        return new VeterinarioResponse(veterinario.getId(), veterinario.getNombre(), veterinario.getEspecialidad());
    }
}
