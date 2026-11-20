package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.domain.Cliente;
import cl.caso2.AranedaCarrasco.domain.Mascota;
import cl.caso2.AranedaCarrasco.repository.ClienteRepository;
import cl.caso2.AranedaCarrasco.repository.MascotaRepository;
import cl.caso2.AranedaCarrasco.repository.ReservaRepository;
import cl.caso2.AranedaCarrasco.web.dto.MascotaRequest;
import cl.caso2.AranedaCarrasco.web.dto.MascotaResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;

    public MascotaService(
            MascotaRepository mascotaRepository,
            ClienteRepository clienteRepository,
            ReservaRepository reservaRepository
    ) {
        this.mascotaRepository = mascotaRepository;
        this.clienteRepository = clienteRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<MascotaResponse> listar() {
        return mascotaRepository.findAllByOrderByNombreAsc().stream()
                .map(MascotaResponse::from)
                .toList();
    }

    public MascotaResponse obtener(Long id) {
        return MascotaResponse.from(buscar(id));
    }

    public List<MascotaResponse> porCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new NoSuchElementException("Cliente no encontrado");
        }
        return mascotaRepository.findByClienteIdOrderByNombreAsc(clienteId).stream()
                .map(MascotaResponse::from)
                .toList();
    }

    @Transactional
    public MascotaResponse crear(Long clienteId, MascotaRequest request) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));
        Mascota mascota = new Mascota(
                cliente,
                request.nombre(),
                request.especie(),
                request.raza(),
                request.fechaNacimiento(),
                request.peso()
        );
        return MascotaResponse.from(mascotaRepository.save(mascota));
    }

    @Transactional
    public MascotaResponse actualizar(Long id, MascotaRequest request) {
        Mascota mascota = buscar(id);
        mascota.setNombre(request.nombre());
        mascota.setEspecie(request.especie());
        mascota.setRaza(request.raza());
        mascota.setFechaNacimiento(request.fechaNacimiento());
        mascota.setPeso(request.peso());
        return MascotaResponse.from(mascotaRepository.save(mascota));
    }

    @Transactional
    public void eliminar(Long id) {
        Mascota mascota = buscar(id);
        if (reservaRepository.existsByMascotaId(id)) {
            throw new IllegalStateException("La mascota tiene reservas asociadas");
        }
        mascotaRepository.delete(mascota);
    }

    private Mascota buscar(Long id) {
        return mascotaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Mascota no encontrada"));
    }
}
