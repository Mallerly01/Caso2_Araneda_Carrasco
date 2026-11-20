package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.web.dto.ClinicaDto;
import cl.caso2.AranedaCarrasco.web.dto.MedicamentoDto;
import cl.caso2.AranedaCarrasco.web.dto.NotificacionDto;
import cl.caso2.AranedaCarrasco.web.dto.NotificacionRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
public class IntegracionService {

    private static final Logger log = LoggerFactory.getLogger(IntegracionService.class);

    private final RestClient restClient;

    public IntegracionService(RestClient restClient) {
        this.restClient = restClient;
    }

    public List<MedicamentoDto> buscarMedicamentos(String nombre) {
        try {
            return restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/api/medicamentos");
                        if (nombre != null && !nombre.isBlank()) {
                            uriBuilder.queryParam("nombre", nombre);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<MedicamentoDto>>() {
                    });
        } catch (RestClientException ex) {
            throw new IntegrationException("No se pudo consultar la API de medicamentos");
        }
    }

    public ClinicaDto obtenerClinica() {
        try {
            return restClient.get()
                    .uri("/api/clinica/ubicacion")
                    .retrieve()
                    .body(ClinicaDto.class);
        } catch (RestClientException ex) {
            throw new IntegrationException("No se pudo consultar la ubicación de la clínica");
        }
    }

    public List<NotificacionDto> listarNotificaciones() {
        try {
            return restClient.get()
                    .uri("/api/notificaciones")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<NotificacionDto>>() {
                    });
        } catch (RestClientException ex) {
            throw new IntegrationException("No se pudo consultar el registro de notificaciones");
        }
    }

    public void notificar(NotificacionRequest request) {
        try {
            restClient.post()
                    .uri("/api/notificaciones")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            log.warn("No se pudo enviar la notificación a la API de integraciones: {}", ex.getMessage());
        }
    }
}
