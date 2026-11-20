package cl.caso2.AranedaCarrasco.web;

import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import cl.caso2.AranedaCarrasco.service.ReservaService;
import cl.caso2.AranedaCarrasco.web.dto.EstadoRequest;
import cl.caso2.AranedaCarrasco.web.dto.ReservaRequest;
import cl.caso2.AranedaCarrasco.web.dto.ReservaResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<ReservaResponse> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long veterinarioId,
            @RequestParam(required = false) EstadoReserva estado,
            @RequestParam(required = false) Long mascotaId
    ) {
        return reservaService.listar(fecha, veterinarioId, estado, mascotaId);
    }

    @GetMapping("/{id}")
    public ReservaResponse obtener(@PathVariable Long id) {
        return reservaService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse crear(@Valid @RequestBody ReservaRequest request) {
        return reservaService.crear(request);
    }

    @PutMapping("/{id}")
    public ReservaResponse actualizar(@PathVariable Long id, @Valid @RequestBody ReservaRequest request) {
        return reservaService.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    public ReservaResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest request) {
        return reservaService.cambiarEstado(id, request.estado());
    }
}
