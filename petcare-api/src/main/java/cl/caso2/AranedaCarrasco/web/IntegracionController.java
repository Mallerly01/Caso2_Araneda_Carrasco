package cl.caso2.AranedaCarrasco.web;

import cl.caso2.AranedaCarrasco.service.IntegracionService;
import cl.caso2.AranedaCarrasco.web.dto.ClinicaDto;
import cl.caso2.AranedaCarrasco.web.dto.MedicamentoDto;
import cl.caso2.AranedaCarrasco.web.dto.NotificacionDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/integraciones")
public class IntegracionController {

    private final IntegracionService integracionService;

    public IntegracionController(IntegracionService integracionService) {
        this.integracionService = integracionService;
    }

    @GetMapping("/medicamentos")
    public List<MedicamentoDto> medicamentos(@RequestParam(required = false) String nombre) {
        return integracionService.buscarMedicamentos(nombre);
    }

    @GetMapping("/clinica")
    public ClinicaDto clinica() {
        return integracionService.obtenerClinica();
    }

    @GetMapping("/notificaciones")
    public List<NotificacionDto> notificaciones() {
        return integracionService.listarNotificaciones();
    }
}
