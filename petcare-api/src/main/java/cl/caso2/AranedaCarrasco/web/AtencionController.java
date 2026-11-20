package cl.caso2.AranedaCarrasco.web;

import cl.caso2.AranedaCarrasco.service.AtencionService;
import cl.caso2.AranedaCarrasco.web.dto.AtencionRequest;
import cl.caso2.AranedaCarrasco.web.dto.AtencionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AtencionController {

    private final AtencionService atencionService;

    public AtencionController(AtencionService atencionService) {
        this.atencionService = atencionService;
    }

    @GetMapping("/api/atenciones")
    public List<AtencionResponse> listar() {
        return atencionService.listar();
    }

    @GetMapping("/api/mascotas/{mascotaId}/atenciones")
    public List<AtencionResponse> porMascota(@PathVariable Long mascotaId) {
        return atencionService.porMascota(mascotaId);
    }

    @PostMapping("/api/atenciones")
    @ResponseStatus(HttpStatus.CREATED)
    public AtencionResponse registrar(@Valid @RequestBody AtencionRequest request) {
        return atencionService.registrar(request);
    }
}
