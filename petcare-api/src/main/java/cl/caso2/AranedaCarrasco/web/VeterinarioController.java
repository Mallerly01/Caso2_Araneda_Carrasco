package cl.caso2.AranedaCarrasco.web;

import cl.caso2.AranedaCarrasco.service.VeterinarioService;
import cl.caso2.AranedaCarrasco.web.dto.VeterinarioResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarios")
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    public VeterinarioController(VeterinarioService veterinarioService) {
        this.veterinarioService = veterinarioService;
    }

    @GetMapping
    public List<VeterinarioResponse> listar() {
        return veterinarioService.listar();
    }
}
