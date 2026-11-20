package cl.caso2.AranedaCarrasco.service;

import cl.caso2.AranedaCarrasco.domain.EstadoReserva;
import cl.caso2.AranedaCarrasco.domain.Mascota;
import cl.caso2.AranedaCarrasco.domain.Veterinario;
import cl.caso2.AranedaCarrasco.repository.MascotaRepository;
import cl.caso2.AranedaCarrasco.repository.ReservaRepository;
import cl.caso2.AranedaCarrasco.repository.VeterinarioRepository;
import cl.caso2.AranedaCarrasco.web.dto.AtencionRequest;
import cl.caso2.AranedaCarrasco.web.dto.AtencionResponse;
import cl.caso2.AranedaCarrasco.web.dto.ReservaRequest;
import cl.caso2.AranedaCarrasco.web.dto.ReservaResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ReservaServiceTests {

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private AtencionService atencionService;

    @Autowired
    private MascotaRepository mascotaRepository;

    @Autowired
    private VeterinarioRepository veterinarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Test
    void rechazaReservaDuplicadaActiva() {
        Mascota mascota = mascotaRepository.findAllByOrderByNombreAsc().get(0);
        Veterinario veterinario = veterinarioRepository.findAllByOrderByNombreAsc().get(0);
        LocalDate fecha = LocalDate.of(2030, 1, 15);
        LocalTime hora = LocalTime.of(9, 0);

        reservaService.crear(new ReservaRequest(mascota.getId(), veterinario.getId(), fecha, hora));

        assertThatThrownBy(() -> reservaService.crear(new ReservaRequest(mascota.getId(), veterinario.getId(), fecha, hora)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Ya existe una reserva");
    }

    @Test
    void reservaCanceladaLiberaElHorario() {
        Mascota mascota = mascotaRepository.findAllByOrderByNombreAsc().get(0);
        Veterinario veterinario = veterinarioRepository.findAllByOrderByNombreAsc().get(0);
        LocalDate fecha = LocalDate.of(2030, 1, 16);
        LocalTime hora = LocalTime.of(10, 0);

        ReservaResponse reserva = reservaService.crear(new ReservaRequest(mascota.getId(), veterinario.getId(), fecha, hora));
        reservaService.cambiarEstado(reserva.id(), EstadoReserva.CANCELADA);

        assertThatCode(() -> reservaService.crear(new ReservaRequest(mascota.getId(), veterinario.getId(), fecha, hora)))
                .doesNotThrowAnyException();
    }

    @Test
    void rechazaTransicionDeEstadoInvalida() {
        Mascota mascota = mascotaRepository.findAllByOrderByNombreAsc().get(0);
        Veterinario veterinario = veterinarioRepository.findAllByOrderByNombreAsc().get(0);

        ReservaResponse reserva = reservaService.crear(new ReservaRequest(
                mascota.getId(),
                veterinario.getId(),
                LocalDate.of(2030, 1, 17),
                LocalTime.of(11, 0)
        ));
        reservaService.cambiarEstado(reserva.id(), EstadoReserva.CANCELADA);

        assertThatThrownBy(() -> reservaService.cambiarEstado(reserva.id(), EstadoReserva.CONFIRMADA))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Transición");
    }

    @Test
    void atencionSoloSeRegistraDesdeReservaConfirmada() {
        Mascota mascota = mascotaRepository.findAllByOrderByNombreAsc().get(0);
        Veterinario veterinario = veterinarioRepository.findAllByOrderByNombreAsc().get(0);

        ReservaResponse reserva = reservaService.crear(new ReservaRequest(
                mascota.getId(),
                veterinario.getId(),
                LocalDate.of(2030, 1, 18),
                LocalTime.of(12, 0)
        ));

        assertThatThrownBy(() -> atencionService.registrar(new AtencionRequest(reserva.id(), "Diagnóstico", "Tratamiento", null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CONFIRMADA");

        reservaService.cambiarEstado(reserva.id(), EstadoReserva.CONFIRMADA);
        AtencionResponse atencion = atencionService.registrar(new AtencionRequest(reserva.id(), "Diagnóstico", "Tratamiento", null));

        assertThat(atencion.id()).isNotNull();
        assertThat(reservaRepository.findById(reserva.id()).orElseThrow().getEstado()).isEqualTo(EstadoReserva.ATENDIDA);
    }
}
