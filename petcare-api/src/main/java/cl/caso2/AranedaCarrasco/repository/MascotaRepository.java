package cl.caso2.AranedaCarrasco.repository;

import cl.caso2.AranedaCarrasco.domain.Mascota;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    @EntityGraph(attributePaths = "cliente")
    List<Mascota> findAllByOrderByNombreAsc();

    @EntityGraph(attributePaths = "cliente")
    List<Mascota> findByClienteIdOrderByNombreAsc(Long clienteId);

    boolean existsByClienteId(Long clienteId);
}
