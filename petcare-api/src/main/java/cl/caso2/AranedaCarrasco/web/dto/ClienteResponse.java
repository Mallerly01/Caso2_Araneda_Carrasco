package cl.caso2.AranedaCarrasco.web.dto;

import cl.caso2.AranedaCarrasco.domain.Cliente;

public record ClienteResponse(
        Long id,
        String nombre,
        String telefono,
        String email
) {
    public static ClienteResponse from(Cliente cliente) {
        return new ClienteResponse(cliente.getId(), cliente.getNombre(), cliente.getTelefono(), cliente.getEmail());
    }
}
