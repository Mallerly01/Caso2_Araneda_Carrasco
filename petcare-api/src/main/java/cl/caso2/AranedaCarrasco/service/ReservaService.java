package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import cl.caso2.AranedaCarrasco.domain.Mascota;
import cl.caso2.AranedaCarrasco.domain.Reserva;
import cl.caso2.AranedaCarrasco.domain.Veterinario;
import cl.caso2.AranedaCarrasco.repository.MascotaRepository;
import cl.caso2.AranedaCarrasco.repository.ReservaRepository;
import cl.caso2.AranedaCarrasco.repository.VeterinarioRepository;
import cl.caso2.AranedaCarrasco.web.dto.NotificacionRequest;
import cl.caso2.AranedaCarrasco.web.dto.ReservaRequest;
import cl.caso2.AranedaCarrasco.web.dto.ReservaResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class ReservaService {

    private static final List<EstadoReserva> ESTADOS_ACTIVOS = List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA);

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final IntegracionService integracionService;

    public ReservaService(
            ReservaRepository reservaRepository,
            MascotaRepository mascotaRepository,
            VeterinarioRepository veterinarioRepository,
            IntegracionService integracionService
    ) {
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
        this.veterinarioRepository = veterinarioRepository;
        this.integracionService = integracionService;
    }

    public List<ReservaResponse> listar(LocalDate fecha, Long veterinarioId, EstadoReserva estado, Long mascotaId) {
        return reservaRepository.findAllByOrderByFechaDescHoraDesc().stream()
                .filter(reserva -> fecha == null || fecha.equals(reserva.getFecha()))
                .filter(reserva -> veterinarioId == null || veterinarioId.equals(reserva.getVeterinario().getId()))
                .filter(reserva -> estado == null || estado == reserva.getEstado())
                .filter(reserva -> mascotaId == null || mascotaId.equals(reserva.getMascota().getId()))
                .map(ReservaResponse::from)
                .toList();
    }

    public ReservaResponse obtener(Long id) {
        return ReservaResponse.from(buscar(id));
    }

    @Transactional
    public ReservaResponse crear(ReservaRequest request) {
        Mascota mascota = mascotaRepository.findById(request.mascotaId())
                .orElseThrow(() -> new NoSuchElementException("Mascota no encontrada"));
        Veterinario veterinario = veterinarioRepository.findById(request.veterinarioId())
                .orElseThrow(() -> new NoSuchElementException("Veterinario no encontrado"));
        verificarDuplicado(request.veterinarioId(), request.fecha(), request.hora(), null);
        Reserva reserva = new Reserva(mascota, veterinario, request.fecha(), request.hora(), EstadoReserva.PENDIENTE);
        return ReservaResponse.from(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaResponse actualizar(Long id, ReservaRequest request) {
        Reserva reserva = buscar(id);
        if (reserva.getEstado() != EstadoReserva.PENDIENTE && reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new IllegalStateException("La reserva no se puede modificar en su estado actual");
        }
        Mascota mascota = mascotaRepository.findById(request.mascotaId())
                .orElseThrow(() -> new NoSuchElementException("Mascota no encontrada"));
        Veterinario veterinario = veterinarioRepository.findById(request.veterinarioId())
                .orElseThrow(() -> new NoSuchElementException("Veterinario no encontrado"));
        verificarDuplicado(request.veterinarioId(), request.fecha(), request.hora(), id);
        reserva.setMascota(mascota);
        reserva.setVeterinario(veterinario);
        reserva.setFecha(request.fecha());
        reserva.setHora(request.hora());
        return ReservaResponse.from(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaResponse cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        Reserva reserva = buscar(id);
        if (!transicionValida(reserva.getEstado(), nuevoEstado)) {
            throw new IllegalStateException("Transición de estado no permitida");
        }
        reserva.setEstado(nuevoEstado);
        ReservaResponse response = ReservaResponse.from(reservaRepository.save(reserva));
        if (nuevoEstado == EstadoReserva.CONFIRMADA || nuevoEstado == EstadoReserva.CANCELADA) {
            String evento = nuevoEstado == EstadoReserva.CONFIRMADA ? "confirmada" : "cancelada";
            integracionService.notificar(new NotificacionRequest(
                    reserva.getMascota().getCliente().getEmail(),
                    nuevoEstado.name(),
                    "Reserva de " + reserva.getMascota().getNombre() + " para el " + reserva.getFecha()
                            + " a las " + reserva.getHora() + " " + evento
            ));
        }
        return response;
    }

    private void verificarDuplicado(Long veterinarioId, LocalDate fecha, LocalTime hora, Long id) {
        boolean existe = id == null
                ? reservaRepository.existsByVeterinarioIdAndFechaAndHoraAndEstadoIn(veterinarioId, fecha, hora, ESTADOS_ACTIVOS)
                : reservaRepository.existsByVeterinarioIdAndFechaAndHoraAndEstadoInAndIdNot(veterinarioId, fecha, hora, ESTADOS_ACTIVOS, id);
        if (existe) {
            throw new IllegalStateException("Ya existe una reserva para ese veterinario en la fecha y hora indicadas");
        }
    }

    private boolean transicionValida(EstadoReserva actual, EstadoReserva nuevo) {
        return switch (actual) {
            case PENDIENTE -> nuevo == EstadoReserva.CONFIRMADA || nuevo == EstadoReserva.CANCELADA;
            case CONFIRMADA -> nuevo == EstadoReserva.CANCELADA;
            case CANCELADA, ATENDIDA -> false;
        };
    }

    private Reserva buscar(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reserva no encontrada"));
    }
}
