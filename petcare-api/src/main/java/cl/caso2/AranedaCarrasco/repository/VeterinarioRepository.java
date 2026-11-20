package cl.caso2.AranedaCarrasco.repository;

import cl.caso2.AranedaCarrasco.domain.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {

    List<Veterinario> findAllByOrderByNombreAsc();
}
