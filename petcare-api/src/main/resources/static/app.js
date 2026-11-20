const API = {
  clientes: '/api/clientes',
  mascotas: '/api/mascotas',
  veterinarios: '/api/veterinarios',
  reservas: '/api/reservas',
  atenciones: '/api/atenciones',
  medicamentos: '/api/integraciones/medicamentos',
  clinica: '/api/integraciones/clinica',
  notificaciones: '/api/integraciones/notificaciones'
};

const state = {
  clientes: [],
  mascotas: [],
  veterinarios: [],
  reservas: [],
  atenciones: [],
  vista: 'dashboard'
};

const titulos = {
  dashboard: ['Hoy en PetCare', 'Lo que necesita la clínica hoy.'],
  clientes: ['Clientes', 'Datos de contacto y mascotas asociadas.'],
  mascotas: ['Pacientes', 'Mascotas, edad y dueño.'],
  reservas: ['Reservas', 'Agenda médica y estados de las horas.'],
  atenciones: ['Atenciones', 'Diagnósticos, tratamientos e historial.'],
  medicamentos: ['Medicamentos', 'Consulta la API de integraciones.'],
  clinica: ['Clínica', 'Ubicación y cómo llegar.'],
  notificaciones: ['Notificaciones', 'Avisos generados por la agenda.']
};

let medicamentosCargados = false;
let mapa = null;
let marcador = null;
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function icon(nombre, clases = 'icon') {
  return `<svg class="${clases}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-${nombre}"></use></svg>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function iniciales(nombre) {
  return String(nombre || '').split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
}

function avatar(nombre, tono = null) {
  const tonos = ['pink', 'mint', 'cream', 'lavender'];
  const elegido = tono || tonos[String(nombre || '').length % tonos.length];
  return `<span class="avatar avatar-${elegido}" aria-hidden="true">${esc(iniciales(nombre))}</span>`;
}

function petAvatar(especie) {
  const texto = String(especie || '').toLowerCase();
  const tipo = texto.includes('perro') ? 'perro' : texto.includes('gato') ? 'gato' : 'otro';
  const nombre = tipo === 'perro' ? 'dog' : tipo === 'gato' ? 'cat' : 'paw';
  return `<span class="pet-avatar pet-avatar-${tipo}" aria-hidden="true">${icon(nombre, 'icon-sm')}</span>`;
}

function fecha(value) {
  if (!value) return '';
  const [anio, mes, dia] = String(value).split('-');
  return `${dia}/${mes}/${anio}`;
}

function hora(value) {
  return value ? String(value).slice(0, 5) : '';
}

function fechaHora(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

function fechaCorta(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

function fechaLarga(value) {
  if (!value) return '';
  const texto = new Date(`${value}T00:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function hoyISO() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
}

function sumarDias(iso, dias) {
  const fechaBase = new Date(`${iso}T00:00:00`);
  fechaBase.setDate(fechaBase.getDate() + dias);
  return `${fechaBase.getFullYear()}-${String(fechaBase.getMonth() + 1).padStart(2, '0')}-${String(fechaBase.getDate()).padStart(2, '0')}`;
}

function relativa(value) {
  if (!value) return '';
  const hoy = hoyISO();
  if (value === hoy) return 'Hoy';
  if (value === sumarDias(hoy, 1)) return 'Mañana';
  if (value === sumarDias(hoy, -1)) return 'Ayer';
  const dias = Math.round((new Date(`${value}T00:00:00`) - new Date(`${hoy}T00:00:00`)) / 86400000);
  if (dias > 1 && dias <= 7) return `En ${dias} días`;
  if (dias < -1) return `Hace ${Math.abs(dias)} días`;
  return fechaLarga(value);
}

function edad(value) {
  if (!value) return '';
  const nacimiento = new Date(`${value}T00:00:00`);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  const meses = hoy.getMonth() - nacimiento.getMonth();
  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) anios--;
  if (anios >= 1) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  const mesesTotales = Math.max(1, Math.floor((hoy - nacimiento) / (1000 * 60 * 60 * 24 * 30.44)));
  return `${mesesTotales} ${mesesTotales === 1 ? 'mes' : 'meses'}`;
}

function peso(value) {
  return value === null || value === undefined ? '—' : `${Number(value).toFixed(2)} kg`;
}

function badge(estado) {
  const clases = {
    PENDIENTE: 'badge-pendiente',
    CONFIRMADA: 'badge-confirmada',
    CANCELADA: 'badge-cancelada',
    ATENDIDA: 'badge-atendida'
  };
  return `<span class="badge ${clases[estado] || ''}">${esc(estado)}</span>`;
}

function toast(mensaje, tipo = 'ok') {
  const elemento = $('#toast');
  elemento.textContent = mensaje;
  elemento.className = `toast ${tipo === 'error' ? 'toast-error' : 'toast-ok'}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elemento.className = 'toast hidden';
  }, 4200);
}

async function api(ruta, opciones = {}) {
  const configuracion = {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(opciones.headers || {})
    }
  };
  const respuesta = await fetch(ruta, configuracion);
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.error || `Error ${respuesta.status}`);
    error.campos = datos.campos;
    throw error;
  }
  return datos;
}

async function cargarTodo() {
  try {
    const [clientes, mascotas, veterinarios, reservas, atenciones] = await Promise.all([
      api(API.clientes),
      api(API.mascotas),
      api(API.veterinarios),
      api(API.reservas),
      api(API.atenciones)
    ]);
    state.clientes = clientes;
    state.mascotas = mascotas;
    state.veterinarios = veterinarios;
    state.reservas = reservas;
    state.atenciones = atenciones;
    renderTodo();
  } catch (error) {
    toast(error.message, 'error');
  }
}

function renderTodo() {
  renderClientes();
  renderMascotas();
  renderReservas();
  renderAtenciones();
  renderDashboard();
}

function emptyRow(columnas, titulo, texto, accion, etiqueta, nombreIcono, secundaria = null) {
  const principal = `<button class="btn btn-primary btn-sm" data-action="${accion}" type="button">${icon(nombreIcono, 'icon-sm')} ${etiqueta}</button>`;
  const extra = secundaria
    ? `<button class="btn btn-ghost btn-sm" data-action="${secundaria.accion}" type="button">${secundaria.etiqueta}</button>`
    : '';
  return `<tr><td colspan="${columnas}" class="empty-cell"><div class="empty-state"><div class="empty-icon">${icon(nombreIcono)}</div><p class="empty-title">${titulo}</p><p class="empty-text">${texto}</p><div class="empty-actions">${principal}${extra}</div></div></td></tr>`;
}

function renderDashboard() {
  const pendientes = state.reservas.filter((reserva) => reserva.estado === 'PENDIENTE');
  const confirmadas = state.reservas.filter((reserva) => reserva.estado === 'CONFIRMADA');
  const activas = state.reservas
    .filter((reserva) => reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA')
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

  $('#resumen-pendientes').textContent = pendientes.length;
  $('#resumen-confirmadas').textContent = confirmadas.length;
  $('#resumen-atenciones').textContent = state.atenciones.length;

  if (state.vista === 'dashboard') {
    $('#view-subtitle').textContent = `${state.clientes.length} clientes · ${state.mascotas.length} mascotas · ${pendientes.length} ${pendientes.length === 1 ? 'reserva pendiente' : 'reservas pendientes'}`;
  }

  if (!activas.length) {
    $('#agenda').innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('calendar')}</div><p class="empty-title">La agenda está libre</p><p class="empty-text">No hay reservas pendientes ni confirmadas. Crea la próxima hora desde aquí.</p><div class="empty-actions"><button class="btn btn-primary btn-sm" data-action="nueva-reserva" type="button">${icon('plus', 'icon-sm')} Nueva reserva</button></div></div>`;
    return;
  }

  const grupos = new Map();
  activas.forEach((reserva) => {
    if (!grupos.has(reserva.fecha)) grupos.set(reserva.fecha, []);
    grupos.get(reserva.fecha).push(reserva);
  });

  $('#agenda').innerHTML = Array.from(grupos.entries()).map(([fecha, reservas]) => `
    <div class="agenda-group">
      <p class="agenda-date">${icon('calendar', 'icon-sm')} <span>${relativa(fecha)}</span><span class="text-muted-foreground/60">·</span><span>${fechaCorta(fecha)}</span></p>
      <div class="agenda-items">
        ${reservas.map((reserva) => {
          const mascota = state.mascotas.find((item) => item.id === reserva.mascotaId);
          const especie = mascota ? mascota.especie : '';
          const accion = reserva.estado === 'PENDIENTE'
            ? `<button class="btn btn-accent btn-sm" data-action="cambiar-estado" data-id="${reserva.id}" data-estado="CONFIRMADA" type="button">${icon('check', 'icon-sm')} Confirmar</button>`
            : '';
          return `<article class="agenda-item">
            <span class="agenda-time">${hora(reserva.hora)}</span>
            <div class="agenda-main">
              <p class="agenda-pet">${esc(reserva.mascotaNombre)}<span class="agenda-species">${esc(especie)}</span></p>
              <p class="agenda-meta">${esc(reserva.clienteNombre)} · ${esc(reserva.veterinarioNombre)}</p>
            </div>
            ${badge(reserva.estado)}
            ${accion}
          </article>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function renderClientes() {
  $('#conteo-clientes').textContent = state.clientes.length;

  const opciones = state.clientes.map((cliente) => `<option value="${cliente.id}">${esc(cliente.nombre)}</option>`).join('');
  const selectorMascota = $('#mascota-cliente');
  const valorMascota = selectorMascota.value;
  selectorMascota.innerHTML = `<option value="">Selecciona un dueño</option>${opciones}`;
  selectorMascota.value = valorMascota || '';

  const filtro = $('#filtro-cliente');
  const valorFiltro = filtro.value;
  filtro.innerHTML = `<option value="">Todos los clientes</option>${opciones}`;
  filtro.value = valorFiltro || '';

  $('#tabla-clientes').innerHTML = state.clientes.length
    ? state.clientes.map((cliente) => `
      <tr>
        <td data-label="Cliente"><div class="cell-main">${avatar(cliente.nombre)}<span class="cell-title">${esc(cliente.nombre)}</span></div></td>
        <td data-label="Teléfono"><span class="tabular">${esc(cliente.telefono || '—')}</span></td>
        <td data-label="Email"><a class="link-button" href="mailto:${esc(cliente.email)}">${esc(cliente.email)}</a></td>
        <td data-label="Acciones"><div class="row-actions">
          <button class="btn btn-ghost btn-sm" data-action="ver-mascotas" data-id="${cliente.id}" type="button">Ver mascotas</button>
          <button class="btn btn-outline btn-sm" data-action="editar-cliente" data-id="${cliente.id}" type="button">${icon('pencil', 'icon-sm')} Editar</button>
          <button class="btn btn-danger btn-sm" data-action="eliminar-cliente" data-id="${cliente.id}" type="button">${icon('trash', 'icon-sm')} Eliminar</button>
        </div></td>
      </tr>`).join('')
    : emptyRow(4, 'Aún no hay clientes', 'Registra el primer cliente para empezar a agendar horas.', 'nuevo-cliente', 'Registrar cliente', 'user');
}

function renderMascotas() {
  const filtro = $('#filtro-cliente').value;
  const lista = filtro
    ? state.mascotas.filter((mascota) => String(mascota.clienteId) === filtro)
    : state.mascotas;
  $('#conteo-mascotas').textContent = lista.length;

  const selectorAtencion = $('#filtro-atencion-mascota');
  const valorAtencion = selectorAtencion.value;
  selectorAtencion.innerHTML = `<option value="">Todas las mascotas</option>${state.mascotas
    .map((mascota) => `<option value="${mascota.id}">${esc(mascota.nombre)} — ${esc(mascota.clienteNombre)}</option>`)
    .join('')}`;
  selectorAtencion.value = valorAtencion || '';

  $('#tabla-mascotas').innerHTML = lista.length
    ? lista.map((mascota) => `
      <tr>
        <td data-label="Mascota"><div class="cell-main">${petAvatar(mascota.especie)}<span class="cell-title">${esc(mascota.nombre)}</span></div></td>
        <td data-label="Especie / raza"><span class="cell-strong">${esc(mascota.especie)}</span><span class="cell-subtitle">${esc(mascota.raza || 'Sin raza registrada')}</span></td>
        <td data-label="Edad"><span class="cell-strong">${edad(mascota.fechaNacimiento)}</span><span class="cell-subtitle tabular">${fecha(mascota.fechaNacimiento)}</span></td>
        <td data-label="Peso"><span class="tabular">${peso(mascota.peso)}</span></td>
        <td data-label="Dueño"><div class="cell-main">${avatar(mascota.clienteNombre, 'mint')}<span class="cell-title">${esc(mascota.clienteNombre)}</span></div></td>
        <td data-label="Acciones"><div class="row-actions">
          <button class="btn btn-ghost btn-sm" data-action="historial-mascota" data-id="${mascota.id}" type="button">Historial</button>
          <button class="btn btn-outline btn-sm" data-action="editar-mascota" data-id="${mascota.id}" type="button">${icon('pencil', 'icon-sm')} Editar</button>
          <button class="btn btn-danger btn-sm" data-action="eliminar-mascota" data-id="${mascota.id}" type="button">${icon('trash', 'icon-sm')} Eliminar</button>
        </div></td>
      </tr>`).join('')
    : emptyRow(6, 'No hay mascotas para este filtro', 'Cambia el cliente o registra una nueva mascota.', 'nueva-mascota', 'Nueva mascota', 'paw');
}

function renderReservas() {
  const filtroFecha = $('#filtro-fecha').value;
  const filtroEstado = $('#filtro-estado').value;
  const lista = state.reservas.filter((reserva) =>
    (!filtroFecha || reserva.fecha === filtroFecha) &&
    (!filtroEstado || reserva.estado === filtroEstado)
  );
  $('#conteo-reservas').textContent = lista.length;

  $('#tabla-reservas').innerHTML = lista.length
    ? lista.map((reserva) => {
      const mascota = state.mascotas.find((item) => item.id === reserva.mascotaId);
      const especie = mascota ? mascota.especie : '';
      const acciones = [];
      if (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') {
        acciones.push(`<button class="btn btn-outline btn-sm" data-action="editar-reserva" data-id="${reserva.id}" type="button">${icon('pencil', 'icon-sm')} Editar</button>`);
      }
      if (reserva.estado === 'PENDIENTE') {
        acciones.push(`<button class="btn btn-accent btn-sm" data-action="cambiar-estado" data-id="${reserva.id}" data-estado="CONFIRMADA" type="button">${icon('check', 'icon-sm')} Confirmar</button>`);
      }
      if (reserva.estado === 'CONFIRMADA') {
        acciones.push(`<button class="btn btn-primary btn-sm" data-action="atender-reserva" data-id="${reserva.id}" type="button">${icon('stethoscope', 'icon-sm')} Atender</button>`);
      }
      if (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') {
        acciones.push(`<button class="btn btn-danger btn-sm" data-action="cambiar-estado" data-id="${reserva.id}" data-estado="CANCELADA" type="button">${icon('x', 'icon-sm')} Cancelar</button>`);
      }
      return `<tr>
        <td data-label="Mascota"><div class="cell-main">${petAvatar(especie)}<div class="cell-stack"><span class="cell-title">${esc(reserva.mascotaNombre)}</span><span class="cell-subtitle">${esc(especie)}</span></div></div></td>
        <td data-label="Dueño"><div class="cell-main">${avatar(reserva.clienteNombre, 'mint')}<span class="cell-title">${esc(reserva.clienteNombre)}</span></div></td>
        <td data-label="Veterinario"><span class="cell-strong">${esc(reserva.veterinarioNombre)}</span></td>
        <td data-label="Fecha"><span class="cell-strong tabular">${fecha(reserva.fecha)}</span><span class="cell-subtitle">${relativa(reserva.fecha)}</span></td>
        <td data-label="Hora"><span class="tabular">${hora(reserva.hora)}</span></td>
        <td data-label="Estado">${badge(reserva.estado)}</td>
        <td data-label="Acciones"><div class="row-actions">${acciones.join('') || '<span class="text-xs text-muted-foreground">Sin acciones</span>'}</div></td>
      </tr>`;
    }).join('')
    : emptyRow(7, 'No hay reservas para este filtro', 'Prueba con otra fecha o estado, o crea una nueva reserva.', 'nueva-reserva', 'Nueva reserva', 'calendar', { accion: 'limpiar-filtros', etiqueta: 'Limpiar filtros' });
}

function renderAtenciones() {
  const filtro = $('#filtro-atencion-mascota').value;
  const lista = filtro
    ? state.atenciones.filter((atencion) => String(atencion.mascotaId) === filtro)
    : state.atenciones;
  $('#conteo-atenciones').textContent = lista.length;

  $('#tabla-atenciones').innerHTML = lista.length
    ? lista.map((atencion) => `
      <tr>
        <td data-label="Mascota"><div class="cell-main">${petAvatar(state.mascotas.find((item) => item.id === atencion.mascotaId)?.especie || '')}<span class="cell-title">${esc(atencion.mascotaNombre)}</span></div></td>
        <td data-label="Reserva"><span class="cell-strong tabular">${fecha(atencion.fecha)}</span><span class="cell-subtitle tabular">${hora(atencion.hora)}</span></td>
        <td data-label="Diagnóstico"><span class="line-clamp-2" title="${esc(atencion.diagnostico)}">${esc(atencion.diagnostico)}</span></td>
        <td data-label="Tratamiento"><span class="line-clamp-2" title="${esc(atencion.tratamiento)}">${esc(atencion.tratamiento)}</span></td>
        <td data-label="Medicamentos"><span class="line-clamp-2" title="${esc(atencion.medicamentos || '')}">${esc(atencion.medicamentos || '—')}</span></td>
        <td data-label="Registrada"><span class="cell-subtitle tabular">${fechaHora(atencion.fechaRegistro)}</span></td>
      </tr>`).join('')
    : emptyRow(6, 'Aún no hay atenciones', 'Registra una atención desde una reserva confirmada para empezar el historial.', 'nueva-atencion', 'Registrar atención', 'stethoscope');
}

async function buscarMedicamentos() {
  const input = $('#medicamento-busqueda');
  const boton = $('#btn-buscar-medicamento');
  const nombre = input.value.trim();
  boton.disabled = true;
  boton.textContent = 'Buscando...';
  boton.setAttribute('aria-busy', 'true');
  try {
    const lista = await api(`${API.medicamentos}?nombre=${encodeURIComponent(nombre)}`);
    medicamentosCargados = true;
    renderMedicamentos(lista);
  } catch (error) {
    medicamentosCargados = true;
    $('#resultado-medicamentos').innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('info')}</div><p class="empty-title">No se pudo consultar la API</p><p class="empty-text">${esc(error.message)}</p><div class="empty-actions"><button class="btn btn-ghost btn-sm" data-action="limpiar-medicamentos" type="button">Reintentar</button></div></div>`;
  } finally {
    boton.disabled = false;
    boton.textContent = 'Buscar';
    boton.removeAttribute('aria-busy');
  }
}

function renderMedicamentos(lista) {
  $('#resultado-medicamentos').innerHTML = lista.length
    ? lista.map((medicamento) => `
      <article class="med-row">
        <span class="med-icon">${icon('pill')}</span>
        <div class="med-main">
          <p class="med-name">${esc(medicamento.nombre)}</p>
          <p class="med-active">Principio activo: ${esc(medicamento.principioActivo)}</p>
        </div>
        <span class="med-dose">${esc(medicamento.dosis)}</span>
      </article>`).join('')
    : `<div class="empty-state"><div class="empty-icon">${icon('pill')}</div><p class="empty-title">No encontramos medicamentos</p><p class="empty-text">Prueba con otro nombre, por ejemplo "amoxicilina".</p><div class="empty-actions"><button class="btn btn-ghost btn-sm" data-action="limpiar-medicamentos" type="button">Ver todos</button></div></div>`;
}

async function cargarClinica() {
  try {
    const clinica = await api(API.clinica);
    $('#clinica-nombre').textContent = clinica.nombre;
    $('#clinica-direccion').textContent = clinica.direccion;
    $('#clinica-coords').textContent = `Latitud ${clinica.lat} · Longitud ${clinica.lng}`;
    const enlace = $('#clinica-como-llegar');
    enlace.href = `https://www.google.com/maps/dir/?api=1&destination=${clinica.lat},${clinica.lng}`;
    enlace.classList.remove('hidden');
    inicializarMapa(clinica);
  } catch (error) {
    $('#clinica-nombre').textContent = 'Ubicación no disponible';
    $('#clinica-direccion').textContent = error.message;
    $('#clinica-coords').textContent = '';
    $('#clinica-como-llegar').classList.add('hidden');
    toast(error.message, 'error');
  }
}

function inicializarMapa(clinica) {
  if (!window.L) return;
  if (!mapa) {
    mapa = L.map('mapa', { scrollWheelZoom: false }).setView([clinica.lat, clinica.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);
  } else {
    mapa.setView([clinica.lat, clinica.lng], 15);
  }
  if (marcador) marcador.remove();
  marcador = L.marker([clinica.lat, clinica.lng])
    .addTo(mapa)
    .bindPopup(`${esc(clinica.nombre)}<br>${esc(clinica.direccion)}`)
    .openPopup();
  setTimeout(() => mapa.invalidateSize(), 150);
}

function renderNotificaciones(lista) {
  const contenedor = $('#lista-notificaciones');
  $('#conteo-notificaciones').textContent = lista.length;
  contenedor.classList.toggle('timeline-empty', !lista.length);
  contenedor.innerHTML = lista.length
    ? lista.map((notificacion) => {
      const tipo = notificacion.tipoEvento === 'CANCELADA' ? 'cancelada' : 'confirmada';
      return `<article class="timeline-item"><span class="timeline-dot timeline-dot-${tipo}"></span><div class="timeline-body"><div class="timeline-head">${badge(notificacion.tipoEvento)}<span class="timeline-date">${fechaHora(notificacion.fecha)}</span></div><p class="timeline-message">${esc(notificacion.mensaje)}</p><p class="timeline-recipient">Para: ${esc(notificacion.destinatario)}</p></div></article>`;
    }).join('')
    : `<div class="empty-state"><div class="empty-icon">${icon('bell')}</div><p class="empty-title">Todavía no hay notificaciones</p><p class="empty-text">Confirma o cancela una reserva para generar el primer aviso.</p><div class="empty-actions"><button class="btn btn-ghost btn-sm" data-action="ir-reservas" type="button">Ver reservas</button></div></div>`;
}

async function cargarNotificaciones() {
  try {
    const lista = await api(API.notificaciones);
    renderNotificaciones(lista);
  } catch (error) {
    $('#conteo-notificaciones').textContent = '0';
    $('#lista-notificaciones').classList.add('timeline-empty');
    $('#lista-notificaciones').innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('info')}</div><p class="empty-title">No se pudo consultar el registro</p><p class="empty-text">${esc(error.message)}</p></div>`;
    toast(error.message, 'error');
  }
}

function limpiarError(form) {
  const contenedor = form.querySelector('[data-form-error]');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  contenedor.classList.add('hidden');
}

function mostrarError(form, error) {
  const contenedor = form.querySelector('[data-form-error]');
  if (!contenedor) {
    toast(error.message, 'error');
    return;
  }
  const mensaje = document.createElement('p');
  mensaje.textContent = error.message;
  contenedor.replaceChildren(mensaje);
  if (error.campos) {
    const lista = document.createElement('ul');
    Object.entries(error.campos).forEach(([campo, detalle]) => {
      const item = document.createElement('li');
      item.textContent = `${campo}: ${detalle}`;
      lista.appendChild(item);
    });
    contenedor.appendChild(lista);
  }
  contenedor.classList.remove('hidden');
  contenedor.scrollIntoView({ block: 'nearest' });
}

function abrirDialogo(id) {
  const dialogo = document.getElementById(id);
  if (dialogo) dialogo.showModal();
}

function abrirCliente(cliente = null) {
  const form = $('#form-cliente');
  form.reset();
  limpiarError(form);
  $('#cliente-id').value = cliente ? cliente.id : '';
  $('#cliente-nombre').value = cliente ? cliente.nombre : '';
  $('#cliente-telefono').value = cliente ? (cliente.telefono || '') : '';
  $('#cliente-email').value = cliente ? cliente.email : '';
  $('#titulo-dialogo-cliente').textContent = cliente ? 'Editar cliente' : 'Nuevo cliente';
  form.querySelector('button[type="submit"]').textContent = cliente ? 'Guardar cambios' : 'Guardar cliente';
  abrirDialogo('dialogo-cliente');
}

function abrirMascota(mascota = null) {
  if (!state.clientes.length) {
    toast('Registra un cliente antes de crear una mascota', 'error');
    return;
  }
  const form = $('#form-mascota');
  form.reset();
  limpiarError(form);
  const filtro = $('#filtro-cliente').value;
  $('#mascota-id').value = mascota ? mascota.id : '';
  $('#mascota-cliente').disabled = Boolean(mascota);
  $('#mascota-cliente').value = mascota ? mascota.clienteId : (filtro || '');
  $('#mascota-nombre').value = mascota ? mascota.nombre : '';
  $('#mascota-especie').value = mascota ? mascota.especie : '';
  $('#mascota-raza').value = mascota ? (mascota.raza || '') : '';
  $('#mascota-fecha').value = mascota ? mascota.fechaNacimiento : '';
  $('#mascota-peso').value = mascota ? mascota.peso : '';
  $('#titulo-dialogo-mascota').textContent = mascota ? 'Editar mascota' : 'Nueva mascota';
  form.querySelector('button[type="submit"]').textContent = mascota ? 'Guardar cambios' : 'Guardar mascota';
  abrirDialogo('dialogo-mascota');
}

function abrirReserva(reserva = null) {
  if (!state.mascotas.length || !state.veterinarios.length) {
    toast('Necesitas al menos una mascota y un veterinario', 'error');
    return;
  }
  const form = $('#form-reserva');
  form.reset();
  limpiarError(form);
  $('#reserva-mascota').innerHTML = state.mascotas
    .map((mascota) => `<option value="${mascota.id}">${esc(mascota.nombre)} — ${esc(mascota.clienteNombre)}</option>`)
    .join('');
  $('#reserva-veterinario').innerHTML = state.veterinarios
    .map((veterinario) => `<option value="${veterinario.id}">${esc(veterinario.nombre)}</option>`)
    .join('');
  $('#reserva-id').value = reserva ? reserva.id : '';
  $('#reserva-mascota').value = reserva ? reserva.mascotaId : (state.mascotas[0]?.id || '');
  $('#reserva-veterinario').value = reserva ? reserva.veterinarioId : (state.veterinarios[0]?.id || '');
  $('#reserva-fecha').value = reserva ? reserva.fecha : '';
  $('#reserva-hora').value = reserva ? hora(reserva.hora) : '';
  $('#titulo-dialogo-reserva').textContent = reserva ? 'Editar reserva' : 'Nueva reserva';
  form.querySelector('button[type="submit"]').textContent = reserva ? 'Guardar cambios' : 'Guardar reserva';
  abrirDialogo('dialogo-reserva');
}

function abrirAtencion(reserva = null) {
  const confirmadas = state.reservas.filter((item) => item.estado === 'CONFIRMADA');
  if (!confirmadas.length) {
    toast('No hay reservas confirmadas para atender', 'error');
    return;
  }
  const form = $('#form-atencion');
  form.reset();
  limpiarError(form);
  const selector = $('#atencion-reserva-select');
  selector.innerHTML = confirmadas
    .map((item) => `<option value="${item.id}">${esc(item.mascotaNombre)} — ${fechaCorta(item.fecha)} ${hora(item.hora)} — ${esc(item.clienteNombre)}</option>`)
    .join('');
  selector.value = reserva ? String(reserva.id) : String(confirmadas[0].id);
  abrirDialogo('dialogo-atencion');
}

function configurarFormularios() {
  $('#form-cliente').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    limpiarError(form);
    const id = $('#cliente-id').value;
    const cuerpo = {
      nombre: $('#cliente-nombre').value.trim(),
      telefono: $('#cliente-telefono').value.trim(),
      email: $('#cliente-email').value.trim()
    };
    try {
      await api(id ? `${API.clientes}/${id}` : API.clientes, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(cuerpo)
      });
      $('#dialogo-cliente').close();
      toast(id ? 'Cliente actualizado' : 'Cliente registrado');
      await cargarTodo();
    } catch (error) {
      mostrarError(form, error);
    }
  });

  $('#form-mascota').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    limpiarError(form);
    const id = $('#mascota-id').value;
    const clienteId = $('#mascota-cliente').value;
    const cuerpo = {
      nombre: $('#mascota-nombre').value.trim(),
      especie: $('#mascota-especie').value.trim(),
      raza: $('#mascota-raza').value.trim(),
      fechaNacimiento: $('#mascota-fecha').value,
      peso: Number($('#mascota-peso').value)
    };
    try {
      await api(id ? `${API.mascotas}/${id}` : `${API.clientes}/${clienteId}/mascotas`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(cuerpo)
      });
      $('#dialogo-mascota').close();
      toast(id ? 'Mascota actualizada' : 'Mascota registrada');
      await cargarTodo();
    } catch (error) {
      mostrarError(form, error);
    }
  });

  $('#form-reserva').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    limpiarError(form);
    const id = $('#reserva-id').value;
    const cuerpo = {
      mascotaId: Number($('#reserva-mascota').value),
      veterinarioId: Number($('#reserva-veterinario').value),
      fecha: $('#reserva-fecha').value,
      hora: $('#reserva-hora').value
    };
    try {
      await api(id ? `${API.reservas}/${id}` : API.reservas, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(cuerpo)
      });
      $('#dialogo-reserva').close();
      toast(id ? 'Reserva actualizada' : 'Reserva creada');
      await cargarTodo();
    } catch (error) {
      mostrarError(form, error);
    }
  });

  $('#form-atencion').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    limpiarError(form);
    const cuerpo = {
      reservaId: Number($('#atencion-reserva-select').value),
      diagnostico: $('#atencion-diagnostico').value.trim(),
      tratamiento: $('#atencion-tratamiento').value.trim(),
      medicamentos: $('#atencion-medicamentos').value.trim() || null
    };
    try {
      await api(API.atenciones, { method: 'POST', body: JSON.stringify(cuerpo) });
      $('#dialogo-atencion').close();
      toast('Atención registrada');
      await cargarTodo();
      irA('atenciones');
    } catch (error) {
      mostrarError(form, error);
    }
  });

  $('#form-medicamentos').addEventListener('submit', (event) => {
    event.preventDefault();
    buscarMedicamentos();
  });
}

function irA(vista) {
  state.vista = vista;
  $$('.view').forEach((seccion) => {
    seccion.classList.toggle('hidden', seccion.id !== `view-${vista}`);
  });
  $$('.nav-item[data-view]').forEach((boton) => {
    boton.classList.toggle('nav-item-active', boton.dataset.view === vista);
  });
  const [titulo, subtitulo] = titulos[vista] || titulos.dashboard;
  $('#view-title').textContent = titulo;
  $('#view-subtitle').textContent = subtitulo;

  if (vista === 'dashboard') renderDashboard();
  if (vista === 'medicamentos' && !medicamentosCargados) buscarMedicamentos();
  if (vista === 'clinica') {
    cargarClinica();
    setTimeout(() => mapa && mapa.invalidateSize(), 300);
  }
  if (vista === 'notificaciones') cargarNotificaciones();
  cerrarMenuMovil();
}

function cerrarMenuMovil() {
  if (window.matchMedia('(min-width: 1024px)').matches) return;
  $('#nav-principal').classList.add('hidden');
  const toggle = $('#toggle-nav');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.querySelector('.menu-icon').classList.remove('hidden');
  toggle.querySelector('.close-icon').classList.add('hidden');
}

function configurarNavegacion() {
  $$('.nav-item[data-view]').forEach((boton) => {
    boton.addEventListener('click', () => irA(boton.dataset.view));
  });
}

function configurarMenu() {
  const toggle = $('#toggle-nav');
  const nav = $('#nav-principal');
  toggle.addEventListener('click', () => {
    const abierto = !nav.classList.contains('hidden');
    nav.classList.toggle('hidden', abierto);
    toggle.setAttribute('aria-expanded', String(!abierto));
    toggle.querySelector('.menu-icon').classList.toggle('hidden', !abierto);
    toggle.querySelector('.close-icon').classList.toggle('hidden', abierto);
  });
}

function configurarFiltros() {
  $('#filtro-cliente').addEventListener('change', renderMascotas);
  $('#filtro-fecha').addEventListener('change', renderReservas);
  $('#filtro-estado').addEventListener('change', renderReservas);
  $('#filtro-atencion-mascota').addEventListener('change', renderAtenciones);
}

function configurarTema() {
  const boton = $('#toggle-dark');
  const aplicar = () => {
    const oscuro = localStorage.getItem('petcare-dark') === '1';
    document.documentElement.classList.toggle('dark', oscuro);
    $('#etiqueta-tema').textContent = oscuro ? 'Modo claro' : 'Modo oscuro';
    $('#icono-tema').innerHTML = icon(oscuro ? 'sun' : 'moon');
  };
  boton.addEventListener('click', () => {
    const oscuro = !document.documentElement.classList.contains('dark');
    localStorage.setItem('petcare-dark', oscuro ? '1' : '0');
    aplicar();
  });
  aplicar();
}

function configurarFechas() {
  const hoy = hoyISO();
  $('#reserva-fecha').min = hoy;
  $('#mascota-fecha').max = hoy;
}

function configurarFechaCabecera() {
  const texto = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#page-date-text').textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
}

document.addEventListener('click', async (event) => {
  const boton = event.target.closest('[data-action]');
  if (boton) {
    const accion = boton.dataset.action;
    const id = Number(boton.dataset.id);
    const cliente = state.clientes.find((item) => item.id === id);
    const mascota = state.mascotas.find((item) => item.id === id);
    const reserva = state.reservas.find((item) => item.id === id);
    try {
      if (accion === 'nuevo-cliente') return abrirCliente();
      if (accion === 'nueva-mascota') return abrirMascota();
      if (accion === 'nueva-reserva') return abrirReserva();
      if (accion === 'nueva-atencion') return abrirAtencion();
      if (accion === 'ir-reservas') return irA('reservas');
      if (accion === 'ir-medicamentos') return irA('medicamentos');
      if (accion === 'editar-cliente' && cliente) return abrirCliente(cliente);
      if (accion === 'editar-mascota' && mascota) return abrirMascota(mascota);
      if (accion === 'editar-reserva' && reserva) return abrirReserva(reserva);
      if (accion === 'ver-mascotas') {
        $('#filtro-cliente').value = String(id);
        irA('mascotas');
        renderMascotas();
        return;
      }
      if (accion === 'historial-mascota') {
        $('#filtro-atencion-mascota').value = String(id);
        irA('atenciones');
        renderAtenciones();
        return;
      }
      if (accion === 'ver-todas-atenciones') {
        $('#filtro-atencion-mascota').value = '';
        renderAtenciones();
        return;
      }
      if (accion === 'limpiar-filtros') {
        $('#filtro-fecha').value = '';
        $('#filtro-estado').value = '';
        renderReservas();
        return;
      }
      if (accion === 'limpiar-medicamentos') {
        $('#medicamento-busqueda').value = '';
        buscarMedicamentos();
        return;
      }
      if (accion === 'recargar-notificaciones') return cargarNotificaciones();
      if (accion === 'eliminar-cliente' && cliente) {
        if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return;
        await api(`${API.clientes}/${id}`, { method: 'DELETE' });
        toast('Cliente eliminado');
        await cargarTodo();
        return;
      }
      if (accion === 'eliminar-mascota' && mascota) {
        if (!confirm(`¿Eliminar a ${mascota.nombre}?`)) return;
        await api(`${API.mascotas}/${id}`, { method: 'DELETE' });
        toast('Mascota eliminada');
        await cargarTodo();
        return;
      }
      if (accion === 'cambiar-estado' && reserva) {
        if (boton.dataset.estado === 'CANCELADA' && !confirm('¿Cancelar esta reserva?')) return;
        await api(`${API.reservas}/${id}/estado`, {
          method: 'PATCH',
          body: JSON.stringify({ estado: boton.dataset.estado })
        });
        toast(`Reserva ${boton.dataset.estado.toLowerCase()} correctamente`);
        await cargarTodo();
        return;
      }
      if (accion === 'atender-reserva' && reserva) {
        abrirAtencion(reserva);
      }
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  const cerrar = event.target.closest('[data-close]');
  if (cerrar) {
    const dialogo = cerrar.closest('dialog');
    if (dialogo) dialogo.close();
  }
});

function init() {
  configurarNavegacion();
  configurarMenu();
  configurarFiltros();
  configurarFormularios();
  configurarTema();
  configurarFechas();
  configurarFechaCabecera();
  cargarTodo();
}

document.addEventListener('DOMContentLoaded', init);
