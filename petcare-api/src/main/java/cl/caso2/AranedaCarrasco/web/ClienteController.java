package cl.caso2.AranedaCarrasco.web;

import cl.caso2.AranedaCarrasco.service.ClienteService;
import cl.caso2.AranedaCarrasco.service.MascotaService;
import cl.caso2.AranedaCarrasco.web.dto.ClienteRequest;
import cl.caso2.AranedaCarrasco.web.dto.ClienteResponse;
import cl.caso2.AranedaCarrasco.web.dto.MascotaRequest;
import cl.caso2.AranedaCarrasco.web.dto.MascotaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;
    private final MascotaService mascotaService;

    public ClienteController(ClienteService clienteService, MascotaService mascotaService) {
        this.clienteService = clienteService;
        this.mascotaService = mascotaService;
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return clienteService.listar();
    }

    @GetMapping("/{id}")
    public ClienteResponse obtener(@PathVariable Long id) {
        return clienteService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponse crear(@Valid @RequestBody ClienteRequest request) {
        return clienteService.crear(request);
    }

    @PutMapping("/{id}")
    public ClienteResponse actualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest request) {
        return clienteService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
    }

    @GetMapping("/{id}/mascotas")
    public List<MascotaResponse> mascotas(@PathVariable Long id) {
        return mascotaService.porCliente(id);
    }

    @PostMapping("/{id}/mascotas")
    @ResponseStatus(HttpStatus.CREATED)
    public MascotaResponse crearMascota(@PathVariable Long id, @Valid @RequestBody MascotaRequest request) {
        return mascotaService.crear(id, request);
    }
}
