// app/dashboard/notificaciones/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import estilos from '../dashboard.module.css';
import estilosNotif from './notificaciones.module.css';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function NotificacionesPage() {
  const usuario = useUsuario();
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    cargarNotificaciones(usuario.ID);
  }, [usuario]);

  const cargarNotificaciones = async (empleadoId: number) => {
    setCargando(true);
    try {
      const res = await fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listar', empleado_id: empleadoId }),
      });
      if (res.ok) setNotificaciones(await res.json());
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (notifId: number) => {
    await fetch('/api/notificaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'marcar_leida', empleado_id: usuario?.ID, notificacion_id: notifId }),
    });
    setNotificaciones(prev => prev.map(n => n.ID === notifId ? { ...n, LEIDA: 1 } : n));
  };

  const marcarTodasLeidas = async () => {
    await fetch('/api/notificaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'marcar_todas_leidas', empleado_id: usuario?.ID }),
    });
    setNotificaciones(prev => prev.map(n => ({ ...n, LEIDA: 1 })));
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    return fechaStr.replace('T', ' ').substring(0, 16);
  };

  const noLeidas = notificaciones.filter(n => !n.LEIDA).length;

  if (!usuario) return null;

  return (
    <main className={estilos.contenido}>
        <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 10 }}>
          Notificaciones
          {noLeidas > 0 && <span className={estilosNotif.badge}>{noLeidas} nuevas</span>}
        </h1>

        {!cargando && noLeidas > 0 && (
          <button className={estilosNotif.botonMarcarTodas} onClick={marcarTodasLeidas}>
            Marcar todas como leídas
          </button>
        )}

        {cargando ? (
          <p>Cargando...</p>
        ) : notificaciones.length === 0 ? (
          <p className={estilosNotif.vacio}>No tienes notificaciones.</p>
        ) : (
          <div className={estilosNotif.listaNotificaciones}>
            {notificaciones.map((notif) => (
              <div
                key={notif.ID}
                className={`${estilosNotif.tarjeta} ${notif.LEIDA ? estilosNotif.leida : estilosNotif.noLeida}`}
              >
                <div className={estilosNotif.cabeceraTarjeta}>
                  <div className={estilosNotif.tituloyTipo}>
                    <span className={estilosNotif.titulo}>{notif.TITULO}</span>
                    <span className={`${estilosNotif.badgeTipo} ${notif.TIPO === 'VACACIONES' ? estilosNotif.vacaciones : notif.TIPO === 'RESPUESTA_CAMBIO' ? estilosNotif.respuesta : estilosNotif.cambio}`}>
                      {notif.TIPO === 'VACACIONES' ? 'Vacaciones' : notif.TIPO === 'CAMBIO_HORARIO' ? 'Horario' : 'Respuesta'}
                    </span>
                  </div>
                  <span className={estilosNotif.fecha}>{formatearFecha(notif.FECHA_CREACION)}</span>
                </div>
                <p className={estilosNotif.mensaje}>{notif.MENSAJE}</p>

                <div className={estilosNotif.acciones}>
                  {!notif.LEIDA && (
                    <button className={estilosNotif.botonMarcar} onClick={() => marcarLeida(notif.ID)}>
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
  );
}
