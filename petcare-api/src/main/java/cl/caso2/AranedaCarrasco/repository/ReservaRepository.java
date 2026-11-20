package cl.caso2.AranedaCarrasco.repository;

import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import cl.caso2.AranedaCarrasco.domain.Reserva;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @EntityGraph(attributePaths = {"mascota", "mascota.cliente", "veterinario"})
    List<Reserva> findAllByOrderByFechaDescHoraDesc();

    @EntityGraph(attributePaths = {"mascota", "mascota.cliente", "veterinario"})
    List<Reserva> findByMascotaIdOrderByFechaDescHoraDesc(Long mascotaId);

    boolean existsByVeterinarioIdAndFechaAndHoraAndEstadoIn(
            Long veterinarioId,
            LocalDate fecha,
            LocalTime hora,
            Collection<EstadoReserva> estados
    );

    boolean existsByVeterinarioIdAndFechaAndHoraAndEstadoInAndIdNot(
            Long veterinarioId,
            LocalDate fecha,
            LocalTime hora,
            Collection<EstadoReserva> estados,
            Long id
    );

    boolean existsByMascotaId(Long mascotaId);
}
