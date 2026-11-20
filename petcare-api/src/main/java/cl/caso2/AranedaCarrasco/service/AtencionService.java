package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.domain.Atencion;
import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import cl.caso2.AranedaCarrasco.domain.Reserva;
import cl.caso2.AranedaCarrasco.repository.AtencionRepository;
import cl.caso2.AranedaCarrasco.repository.MascotaRepository;
import cl.caso2.AranedaCarrasco.repository.ReservaRepository;
import cl.caso2.AranedaCarrasco.web.dto.AtencionRequest;
import cl.caso2.AranedaCarrasco.web.dto.AtencionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class AtencionService {

    private final AtencionRepository atencionRepository;
    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;

    public AtencionService(
            AtencionRepository atencionRepository,
            ReservaRepository reservaRepository,
            MascotaRepository mascotaRepository
    ) {
        this.atencionRepository = atencionRepository;
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
    }

    public List<AtencionResponse> listar() {
        return atencionRepository.findAllByOrderByFechaRegistroDesc().stream()
                .map(AtencionResponse::from)
                .toList();
    }

    public List<AtencionResponse> porMascota(Long mascotaId) {
        if (!mascotaRepository.existsById(mascotaId)) {
            throw new NoSuchElementException("Mascota no encontrada");
        }
        return atencionRepository.findByReserva_Mascota_IdOrderByFechaRegistroDesc(mascotaId).stream()
                .map(AtencionResponse::from)
                .toList();
    }

    @Transactional
    public AtencionResponse registrar(AtencionRequest request) {
        Reserva reserva = reservaRepository.findById(request.reservaId())
                .orElseThrow(() -> new NoSuchElementException("Reserva no encontrada"));
        if (reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new IllegalStateException("Solo se puede registrar atención de una reserva CONFIRMADA");
        }
        if (atencionRepository.existsByReservaId(request.reservaId())) {
            throw new IllegalStateException("La reserva ya tiene una atención registrada");
        }
        Atencion atencion = new Atencion(
                reserva,
                request.diagnostico(),
                request.tratamiento(),
                request.medicamentos(),
                LocalDateTime.now()
        );
        Atencion guardada = atencionRepository.save(atencion);
        reserva.setEstado(EstadoReserva.ATENDIDA);
        reservaRepository.save(reserva);
        return AtencionResponse.from(guardada);
    }
}
