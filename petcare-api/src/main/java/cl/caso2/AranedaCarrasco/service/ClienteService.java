package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.domain.Cliente;
import cl.caso2.AranedaCarrasco.repository.ClienteRepository;
import cl.caso2.AranedaCarrasco.repository.MascotaRepository;
import cl.caso2.AranedaCarrasco.web.dto.ClienteRequest;
import cl.caso2.AranedaCarrasco.web.dto.ClienteResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final MascotaRepository mascotaRepository;

    public ClienteService(ClienteRepository clienteRepository, MascotaRepository mascotaRepository) {
        this.clienteRepository = clienteRepository;
        this.mascotaRepository = mascotaRepository;
    }

    public List<ClienteResponse> listar() {
        return clienteRepository.findAllByOrderByNombreAsc().stream()
                .map(ClienteResponse::from)
                .toList();
    }

    public ClienteResponse obtener(Long id) {
        return ClienteResponse.from(buscar(id));
    }

    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        if (clienteRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("El email ya está registrado");
        }
        Cliente cliente = new Cliente(request.nombre(), request.telefono(), request.email());
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse actualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscar(id);
        if (clienteRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new IllegalStateException("El email ya está registrado");
        }
        cliente.setNombre(request.nombre());
        cliente.setTelefono(request.telefono());
        cliente.setEmail(request.email());
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = buscar(id);
        if (mascotaRepository.existsByClienteId(id)) {
            throw new IllegalStateException("El cliente tiene mascotas asociadas");
        }
        clienteRepository.delete(cliente);
    }

    private Cliente buscar(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));
    }
}
