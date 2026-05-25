// app/dashboard/gestion-horarios/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import estilosGantt from '../planificacion-mes/planificacion.module.css';
import estilosForm from './gestion.module.css';
import { agruparDiasMesPorSemanas, crearFechaLocalDesdeISO, normalizarFechaISO, obtenerIndiceDiaLunes } from '@/app/lib/fechas';
import { puedeGestionarHorarios } from '@/app/lib/permisos';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function GestionHorariosPage() {
  const usuario = useUsuario();
  const enrutador = useRouter(); // redirige si el usuario no tiene permisos
  const [equipo, setEquipo] = useState<any[]>([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState<any[]>([]);
  const [datosHorario, setDatosHorario] = useState<any[]>([]);
  
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('X');
  const [pintando, setPintando] = useState<{ dia: string | null, slotInicio: number | null, slotFin: number | null }>({ dia: null, slotInicio: null, slotFin: null });
  const [mensajeEdicion, setMensajeEdicion] = useState('');

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const inicialesDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  useEffect(() => {
    if (!usuario) return;
    // Protección de ruta: si el usuario no es responsable, volvemos al dashboard
    if (!puedeGestionarHorarios(usuario.PUESTO_ID)) {
      enrutador.push('/dashboard');
      return;
    }
    cargarEquipo(usuario.ID, usuario);
    cargarTurnos();
  }, [usuario, enrutador]);

  useEffect(() => {
    if (empleadoSeleccionado) {
      cargarHorarioEmpleado(parseInt(empleadoSeleccionado), mesActual + 1, anioActual);
    }
  }, [empleadoSeleccionado, mesActual, anioActual]);

  const cargarEquipo = async (responsableId: number, usuarioActual: any) => {
    const res = await fetch('/api/equipo-responsable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responsable_id: responsableId })
    });
    if (res.ok) {
      let data = await res.json();
      // Si el usuario no tiene responsable asignado puede gestionarse a sí mismo
      const yaIncluido = data.some((e: any) => e.ID === usuarioActual.ID);
      if (!usuarioActual.RESPONSABLE_ID && !yaIncluido) {
        data = [{ ID: usuarioActual.ID, NOMBRE: usuarioActual.NOMBRE, APELLIDOS: usuarioActual.APELLIDOS }, ...data];
      }
      setEquipo(data);
      if (data.length > 0) setEmpleadoSeleccionado(data[0].ID); 
    }
  };

  const cargarTurnos = async () => {
    const res = await fetch('/api/turnos');
    if (res.ok) setTurnosDisponibles(await res.json());
  };

  const cargarHorarioEmpleado = async (id: number, mes: number, anio: number) => {
    const res = await fetch('/api/planificacion-mes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empleado_id: id, mes, anio })
    });
    if (res.ok) setDatosHorario(await res.json());
  };

  // LÓGICA DE DIBUJO EN EL GANTT
  
  // Transforma el número de "ranura" (0 a 47) en una hora real (ej: "14:30")
  const slotToTime = (slotIndex: number) => {
    let totalMinutes = (6 * 60) + (slotIndex * 30); // Empezamos a las 06:00
    if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60; // Si pasa de medianoche
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const timeToSlot = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    let totalMinutes = h * 60 + m;
    if (h < 6) totalMinutes += 24 * 60;
    return Math.floor((totalMinutes - 6 * 60) / 30);
  };

  const obtenerRangoSlotsTurno = (entrada: string, salida: string) => {
    const inicio = timeToSlot(entrada);
    let fin = timeToSlot(salida);

    if (fin <= inicio) {
      fin += 48;
    }

    return { inicio, fin };
  };

  const datosPorFecha = datosHorario.reduce((acc, turno) => {
    const fecha = normalizarFechaISO(turno.FECHA);
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(turno);
    return acc;
  }, {} as Record<string, any[]>);

  const obtenerSlotsOcupados = (fecha: string) => {
    const ocupados = new Set<number>();
    const turnosDia = datosPorFecha[fecha] || [];

    turnosDia.forEach((turno) => {
      const { inicio, fin } = obtenerRangoSlotsTurno(turno.HORA_ENTRADA, turno.HORA_SALIDA);
      for (let slot = inicio; slot < fin; slot++) {
        ocupados.add(slot);
      }
    });

    return ocupados;
  };

  const rangoTocaSlotsOcupados = (fecha: string, slotInicio: number, slotFin: number) => {
    const minSlot = Math.min(slotInicio, slotFin);
    const maxSlot = Math.max(slotInicio, slotFin);
    const ocupados = obtenerSlotsOcupados(fecha);

    for (let slot = minSlot; slot <= maxSlot; slot++) {
      if (ocupados.has(slot)) {
        return true;
      }
    }

    return false;
  };

  const cambiarMes = (desplazamiento: number) => {
    const nuevaFecha = new Date(anioActual, mesActual + desplazamiento, 1);
    setMesActual(nuevaFecha.getMonth());
    setAnioActual(nuevaFecha.getFullYear());
    setPintando({ dia: null, slotInicio: null, slotFin: null });
    setMensajeEdicion('');
  };

  const handleMouseDown = (dia: string, slot: number) => {
    if (obtenerSlotsOcupados(dia).has(slot)) {
      setMensajeEdicion('Ese tramo ya está ocupado. Borra la barra existente antes de volver a pintarla.');
      return;
    }

    setMensajeEdicion('');
    // Empezamos a pintar
    setPintando({ dia, slotInicio: slot, slotFin: slot });
  };

  const handleMouseEnter = (dia: string, slot: number) => {
    // Si estamos pintando en el mismo día, actualizamos el final de la barra
    if (pintando.dia === dia && pintando.slotInicio !== null) {
      if (rangoTocaSlotsOcupados(dia, pintando.slotInicio, slot)) {
        setMensajeEdicion('No se permiten solapes. Borra el turno existente y vuelve a dibujarlo completo.');
        return;
      }

      setPintando(prev => ({ ...prev, slotFin: slot }));
    }
  };

  const handleMouseUp = async () => {
    // Soltamos el ratón. Calculamos horas y guardamos.
    if (!pintando.dia || pintando.slotInicio === null || pintando.slotFin === null) return;

    const minSlot = Math.min(pintando.slotInicio, pintando.slotFin);
    const maxSlot = Math.max(pintando.slotInicio, pintando.slotFin);

    if (rangoTocaSlotsOcupados(pintando.dia, minSlot, maxSlot)) {
      setPintando({ dia: null, slotInicio: null, slotFin: null });
      setMensajeEdicion('No se ha guardado el tramo porque se solapa con otro ya existente.');
      return;
    }
    
    const horaEntrada = slotToTime(minSlot);
    const horaSalida = slotToTime(maxSlot + 1); // +1 porque el turno acaba al final del bloque
    const diaTurno = pintando.dia;

    // Reseteamos el lápiz para que la interfaz sea rápida
    setPintando({ dia: null, slotInicio: null, slotFin: null });

    // Guardamos en la base de datos
    const res = await fetch('/api/guardar-turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empleado_id: empleadoSeleccionado,
        fecha: diaTurno,
        hora_entrada: horaEntrada + ":00",
        hora_salida: horaSalida + ":00",
        turno_codigo: turnoSeleccionado,
        responsable_puesto_id: usuario.PUESTO_ID,
        responsable_id: usuario.ID
      })
    });

    if (res.ok) {
      setMensajeEdicion('Turno guardado correctamente.');
      cargarHorarioEmpleado(parseInt(empleadoSeleccionado), mesActual + 1, anioActual);
    } else {
      const data = await res.json();
      setMensajeEdicion(data.mensaje || 'Error al asignar el turno.');
    }
  };


  // BORRADO DE TURNOS
  const handleBorrarTurno = async (evento: React.MouseEvent<HTMLButtonElement>, turno: any, fecha: string) => {
    evento.stopPropagation();
    setPintando({ dia: null, slotInicio: null, slotFin: null });

    const confirmar = window.confirm(`¿Borrar el turno ${turno.TURNO_CODIGO} del ${fecha}?`);
    if (!confirmar) return;

    const res = await fetch('/api/borrar-turno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empleado_id: empleadoSeleccionado,
        fecha,
        hora_entrada: turno.HORA_ENTRADA,
        hora_salida: turno.HORA_SALIDA,
        turno_codigo: turno.TURNO_CODIGO,
        responsable_puesto_id: usuario.PUESTO_ID,
        responsable_id: usuario.ID
      })
    });

    if (res.ok) {
      setMensajeEdicion('Turno borrado correctamente.');
      cargarHorarioEmpleado(parseInt(empleadoSeleccionado), mesActual + 1, anioActual);
    } else {
      alert("Error al borrar el turno.");
    }
  };

  // FUNCIONES MATEMÁTICAS DEL GANTT
  const calcularPosicion = (horaStr: string) => {
    if (!horaStr) return 0;
    const [h, m] = horaStr.split(':').map(Number);
    let totalMinutos = h * 60 + m;
    if (h < 6) totalMinutos += 24 * 60; 
    const minutosDesdeInicio = totalMinutos - (6 * 60);
    return (minutosDesdeInicio / (24 * 60)) * 100; 
  };

  const calcularAncho = (entrada: string, salida: string) => {
    if (!entrada || !salida) return 0;
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);
    const minE = hE * 60 + mE;
    let minS = hS * 60 + mS;
    if (minS <= minE) minS += 24 * 60;
    const duracionMinutos = minS - minE;
    return (duracionMinutos / (24 * 60)) * 100;
  };

  const semanas = agruparDiasMesPorSemanas(anioActual, mesActual);
  if (!usuario) return null;

  return (
    // onMouseUp en la raíz del componente para capturar el evento aunque el usuario
    // suelte el ratón fuera del área de dibujo del Gantt
    <div className={`${estilosGantt.limitadorAncho} ${estilosForm.noSelect}`} onMouseUp={handleMouseUp}>
        
        {/* BARRA DE HERRAMIENTAS */}
        {equipo.length > 0 ? (
          <div className={estilosForm.toolbarPintar}>
            <div className={estilosForm.toolbarHeader}>
              <div>
                <p className={estilosForm.toolbarTitulo}>Modo edición</p>
                <p className={estilosForm.toolbarTexto}>
                  Selecciona empleado y turno. Después arrastra sobre el calendario para pintar el horario sin solapar tramos ya existentes.
                </p>
              </div>
            </div>

            {mensajeEdicion && <p className={estilosForm.mensajeEdicion}>{mensajeEdicion}</p>}

            <div className={estilosForm.herramientasContainer}>
              <div className={estilosForm.herramientaGroup}>
                <label>Empleado</label>
                <select value={empleadoSeleccionado} onChange={(e) => setEmpleadoSeleccionado(e.target.value)}>
                  {equipo.map(emp => (
                    <option key={emp.ID} value={emp.ID}>{emp.NOMBRE} {emp.APELLIDOS}</option>
                  ))}
                </select>
              </div>

              <div className={estilosForm.herramientaGroup}>
                <label>Turno a pintar</label>
                <select value={turnoSeleccionado} onChange={(e) => setTurnoSeleccionado(e.target.value)}>
                  {turnosDisponibles.map(t => (
                    <option key={t.CODIGO} value={t.CODIGO}>{t.CODIGO} - {t.DESCRIPCION}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className={estilosForm.alerta}>No tienes empleados a tu cargo. No puedes gestionar horarios.</div>
        )}

        {/* DIAGRAMA DE GANTT (Ahora con modo dibujo) */}
        {empleadoSeleccionado && (
          <>
            <nav className={estilosGantt.navbarPlanificacion}>
              <button className={estilosGantt.botonNav} onClick={() => cambiarMes(-1)}>Anterior</button>
              <div className={estilosGantt.titulosCentrados}>
                <h1 className={estilosGantt.nombreEmpleado}>
                  Horario de {equipo.find(e => e.ID === parseInt(empleadoSeleccionado))?.NOMBRE}
                </h1>
                <h2 className={estilosGantt.tituloMesAnio}>{nombresMeses[mesActual]} | {anioActual}</h2>
              </div>
              <button className={estilosGantt.botonNav} onClick={() => cambiarMes(1)}>Siguiente</button>
            </nav>

            <div className={estilosGantt.ganttScrollArea}>
              <div className={estilosGantt.ganttInner}>
                {semanas.map((semana) => (
                  <div key={semana.id} className={estilosGantt.semanaBlock}>
                    <div className={estilosGantt.semanaTitulo}>
                      <div className={estilosGantt.semanaNombre}>Semana {semana.indice}</div>
                      <div className={estilosGantt.semanaHoras}>
                        {Array.from({ length: 24 }, (_, i) => (i + 6) % 24).map(h => (
                          <div key={h} className={estilosGantt.bloqueHora}><span>{h}</span></div>
                        ))}
                      </div>
                    </div>
                    {semana.fechas.map((fecha: string) => {
                      const fechaLocal = crearFechaLocalDesdeISO(fecha);
                      const slotsOcupados = obtenerSlotsOcupados(fecha);

                      return (
                      <div key={fecha} className={estilosGantt.filaDia}>
                        <span className={estilosGantt.diaLabel}>{inicialesDias[obtenerIndiceDiaLunes(fechaLocal)]} - {fechaLocal.getDate()}</span>
                        <div className={estilosGantt.carril}>
                          
                          {/* Malla de fondo */}
                          <div className={estilosGantt.malla}></div>

                          {/* Turnos reales guardados */}
                          {(datosPorFecha[fecha] || []).map((t, idx) => (
                            <div key={idx} className={`${estilosGantt.barra} ${estilosForm.barraEditable}`} style={{
                              left: `${calcularPosicion(t.HORA_ENTRADA)}%`,
                              width: `${calcularAncho(t.HORA_ENTRADA, t.HORA_SALIDA)}%`,
                              backgroundColor: t.COLOR_HEX
                            }}>
                              <span className={estilosForm.codigoTurno}>{t.TURNO_CODIGO}</span>
                              <button
                                type="button"
                                className={estilosForm.botonBorrarTurno}
                                onClick={(evento) => handleBorrarTurno(evento, t, fecha)}
                              >
                                Borrar
                              </button>
                            </div>
                          ))}

                          {/* Capa interactiva: Las 48 ranuras invisibles para detectar el ratón */}
                          <div className={estilosForm.gridInteractivo}>
                            {Array.from({ length: 48 }).map((_, slotIdx) => (
                              <div 
                                key={slotIdx} 
                                className={`${estilosForm.slotInteractivo} ${slotsOcupados.has(slotIdx) ? estilosForm.slotOcupado : ''}`}
                                onMouseDown={() => handleMouseDown(fecha, slotIdx)}
                                onMouseEnter={() => handleMouseEnter(fecha, slotIdx)}
                              />
                            ))}
                          </div>

                          {/* Barra fantasma: Se dibuja en tiempo real mientras el usuario arrastra */}
                          {pintando.dia === fecha && pintando.slotInicio !== null && pintando.slotFin !== null && (
                            <div className={estilosForm.barraGhost} style={{
                              left: `${(Math.min(pintando.slotInicio, pintando.slotFin) / 48) * 100}%`,
                              width: `${((Math.max(pintando.slotInicio, pintando.slotFin) - Math.min(pintando.slotInicio, pintando.slotFin) + 1) / 48) * 100}%`,
                              backgroundColor: turnosDisponibles.find(t => t.CODIGO === turnoSeleccionado)?.COLOR_HEX || '#fde047'
                            }}>
                              {turnoSeleccionado}
                            </div>
                          )}

                        </div>
                      </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
  );
}
