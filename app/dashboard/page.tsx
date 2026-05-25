// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import estilos from './dashboard.module.css';
import { crearFechaLocalDesdeISO } from '@/app/lib/fechas';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function DashboardPage() {
  const usuario = useUsuario();

  // Estados propios de esta página (horario, equipo, notificaciones, fichaje)
  const [horarioSemana, setHorarioSemana] = useState<any[]>([]);
  const [equipoDia, setEquipoDia] = useState<any[]>([]);
  const [notificacionesSinLeer, setNotificacionesSinLeer] = useState<any[]>([]);
  const [fichajeAbierto, setFichajeAbierto] = useState(false);
  const [fichajeCargando, setFichajeCargando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    cargarDatosDashboard(usuario.ID, usuario.PUESTO_ID);
    cargarNotificaciones(usuario.ID);
    cargarEstadoFichaje(usuario.ID);
  }, [usuario]);

  // FUNCIÓN PARA BUSCAR LOS DATOS REALES
  const cargarDatosDashboard = async (id_empleado: number, id_puesto: number) => {
    try {
      const respuesta = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: id_empleado, puesto_id: id_puesto }),
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        
        // Guardamos las listas que nos mandó el servidor en nuestras variables
        setHorarioSemana(datos.horario);
        setEquipoDia(datos.equipo);
      }
    } catch (error) {
      console.error("Fallo al cargar los datos:", error);
    }
  };

  const cargarEstadoFichaje = async (id: number) => {
    setFichajeCargando(true);
    try {
      const res = await fetch('/api/fichaje-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setFichajeAbierto(data.abierto);
      }
    } finally {
      setFichajeCargando(false);
    }
  };

  // Función de fichar con geolocalización
  const registrarFichaje = async () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        try {
          const respuesta = await fetch('/api/fichar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              empleado_id: usuario.ID,
              lat: posicion.coords.latitude,
              lon: posicion.coords.longitude,
            }),
          });
          const datos = await respuesta.json();
          if (respuesta.ok) {
            alert(datos.mensaje);
            setFichajeAbierto(prev => !prev);
          } else {
            alert("Error: " + datos.mensaje);
          }
        } catch {
          alert("No se ha podido conectar con el servidor para fichar.");
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Debes permitir el acceso a tu ubicación para poder fichar.");
        } else {
          alert("No se pudo obtener tu ubicación. Comprueba que el GPS está activado.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const cargarNotificaciones = async (empleadoId: number) => {
    try {
      const res = await fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listar', empleado_id: empleadoId }),
      });
      if (res.ok) {
        const todas = await res.json();
        setNotificacionesSinLeer(todas.filter((n: any) => !n.LEIDA).slice(0, 5));
      }
    } catch { /* silencioso */ }
  };

  if (!usuario) return null; 

  // Función auxiliar para que la hora (09:00:00) se vea bonita (09:00)
  const formatearHora = (hora: string) => {
    return hora ? hora.substring(0, 5) : "Libre";
  };

  // Función auxiliar para sacar la inicial del día de una fecha
  const obtenerDiaLetra = (fechaString: string) => {
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const fecha = crearFechaLocalDesdeISO(fechaString);
    return dias[fecha.getDay()];
  };

  // Función auxiliar para sacar el número del día (ej: 24)
  const obtenerDiaNumero = (fechaString: string) => {
    const fecha = crearFechaLocalDesdeISO(fechaString);
    return fecha.getDate();
  };


  return (
    <main className={estilos.contenido}>
      {/* Botón de Entrada/Salida con geolocalización */}
      <button
        className={`${estilos.botonFichar} ${fichajeAbierto ? estilos.botonFicharSalida : ''}`}
        onClick={registrarFichaje}
        disabled={fichajeCargando}
      >
        {fichajeCargando ? '...' : fichajeAbierto ? 'Salida' : 'Entrada'}
      </button>

        <div className={estilos.contenedorCajas}>

          {/* FILA SUPERIOR: Horario + Equipo */}
          <div className={estilos.filaDoble}>

          {/* CAJA IZQUIERDA: Horario */}
          <div className={estilos.cajaInfo}>
            <h2>HORARIO</h2>
            <div className={estilos.listaScroll}>
              {horarioSemana.map((dia, index) => (
                <div key={index} className={estilos.filaInfo}>
                  <div className={estilos.fechaFila}>
                    <span>{obtenerDiaLetra(dia.FECHA)}</span>
                    <span>{obtenerDiaNumero(dia.FECHA)}</span>
                  </div>
                  <span>{formatearHora(dia.HORA_ENTRADA)} - {formatearHora(dia.HORA_SALIDA)}</span>
                </div>
              ))}
              {horarioSemana.length === 0 && (
                <p className={estilos.textoVacio}>No tienes horario asignado esta semana.</p>
              )}
            </div>
          </div>

          {/* CAJA DERECHA: Equipo */}
          <div className={estilos.cajaInfo}>
            <h2>EQUIPO</h2>
            <div className={estilos.listaScroll}>
               {equipoDia.map((compi, index) => (
                <div key={index} className={estilos.filaInfo}>
                  <span>{compi.NOMBRE} {compi.APELLIDOS}</span>
                  <span>{formatearHora(compi.HORA_ENTRADA)} - {formatearHora(compi.HORA_SALIDA)}</span>
                </div>
              ))}
              {equipoDia.length === 0 && (
                <p className={estilos.textoVacio}>No hay compañeros con horario hoy.</p>
              )}
            </div>
          </div>

          </div>

          {/* CAJA INFERIOR: Notificaciones recientes */}
          <div className={estilos.cajaInfoAncha}>
            <h2>
              NOTIFICACIONES
              {notificacionesSinLeer.length > 0 && (
                <span className={estilos.badgeCaja}>{notificacionesSinLeer.length}</span>
              )}
            </h2>
            <div className={estilos.listaScroll}>
              {notificacionesSinLeer.length === 0 ? (
                <p className={estilos.textoVacio}>No tienes notificaciones nuevas.</p>
              ) : (
                notificacionesSinLeer.map((notif) => (
                  <div key={notif.ID} className={estilos.filaInfo} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <strong style={{ fontSize: 13 }}>{notif.TITULO}</strong>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{notif.MENSAJE.substring(0, 80)}{notif.MENSAJE.length > 80 ? '…' : ''}</span>
                  </div>
                ))
              )}
            </div>
            <a href="/dashboard/notificaciones" className={estilos.verTodo}>
              Ver todas las notificaciones →
            </a>
          </div>

        </div>

    </main>
  );
}
