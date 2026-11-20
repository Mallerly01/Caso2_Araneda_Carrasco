package cl.caso2.AranedaCarrasco.repository;

import cl.caso2.AranedaCarrasco.domain.Atencion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtencionRepository extends JpaRepository<Atencion, Long> {

    @EntityGraph(attributePaths = {"reserva", "reserva.mascota"})
    List<Atencion> findAllByOrderByFechaRegistroDesc();

    @EntityGraph(attributePaths = {"reserva", "reserva.mascota"})
    List<Atencion> findByReserva_Mascota_IdOrderByFechaRegistroDesc(Long mascotaId);

    boolean existsByReservaId(Long reservaId);
}
