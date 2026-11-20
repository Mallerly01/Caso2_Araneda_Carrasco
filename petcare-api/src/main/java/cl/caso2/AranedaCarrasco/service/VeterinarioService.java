package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.repository.VeterinarioRepository;
import cl.caso2.AranedaCarrasco.web.dto.VeterinarioResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class VeterinarioService {

    private final VeterinarioRepository veterinarioRepository;

    public VeterinarioService(VeterinarioRepository veterinarioRepository) {
        this.veterinarioRepository = veterinarioRepository;
    }

    public List<VeterinarioResponse> listar() {
        return veterinarioRepository.findAllByOrderByNombreAsc().stream()
                .map(VeterinarioResponse::from)
                .toList();
    }
}
