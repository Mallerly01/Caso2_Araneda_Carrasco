package cl.caso2.AranedaCarrasco.repository;

import cl.caso2.AranedaCarrasco.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Cliente> findAllByOrderByNombreAsc();
}
