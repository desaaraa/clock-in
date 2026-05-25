// app/dashboard/components/Navbar.tsx

// Componente reutilizable que contiene la barra de navegación del dashboard.

"use client"; // Necesario porque usa useState, useEffect y useRouter

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import estilos from '../dashboard.module.css';
import { puedeGestionarHorarios } from '@/app/lib/permisos';
import { UsuarioLogueado } from '@/app/lib/hooks/useUsuario';

export default function Navbar() {
  const enrutador = useRouter();

  // Estado interno del Navbar: solo lo que el propio navbar necesita saber
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);
  const [mostrarGestionHorarios, setMostrarGestionHorarios] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const guardado = localStorage.getItem('usuarioLogueado');

    // Si no hay sesión, el Navbar redirige al login.
    if (!guardado) {
      enrutador.push('/login');
      return;
    }

    const user: UsuarioLogueado = JSON.parse(guardado);
    setUsuario(user);
    setMostrarGestionHorarios(puedeGestionarHorarios(user.PUESTO_ID));

    // Cargamos el contador de notificaciones sin leer para el badge del navbar
    cargarConteoNotificaciones(user.ID);
  }, [enrutador]);

  const cargarConteoNotificaciones = async (empleadoId: number) => {
    try {
      const res = await fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'listar', empleado_id: empleadoId }),
      });
      if (res.ok) {
        const todas = await res.json();
        // Contamos solo las no leídas
        setNotifCount(todas.filter((n: any) => !n.LEIDA).length);
      }
    } catch {
      // Si falla la carga de notificaciones, no bloqueamos la app
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioLogueado');
    enrutador.push('/login');
  };

  // Mientras el usuario no esté cargado, no renderizamos nada
  if (!usuario) return null;

  return (
    <>
      <nav className={estilos.navbar}>

        <div className={estilos.grupoIzquierdo}>

          <Link href="/dashboard" className={estilos.logoContainer}>
            <Image src="/images/logoHornoDeOro.png" alt="Logo Horno de Oro" width={100} height={40} />
          </Link>

          <div className={estilos.navLinksIzquierda}>
            
            <div className={estilos.dropdown}>
              <button className={estilos.dropbtn}>Empleado/a ▼</button>
              <div className={estilos.dropdownContent}>
                <a href="/dashboard/mis-datos">Mis Datos</a>
              </div>
            </div>

            <div className={estilos.dropdown}>
              <button className={estilos.dropbtn}>Planificación ▼</button>
              <div className={estilos.dropdownContent}>
                <a href="/dashboard/planificacion-semana">Semana Equipo</a>
                <a href="/dashboard/planificacion-mes">Mes Empleado/a</a>
                {/* Solo visible para responsables (puestos 1 y 2) */}
                {mostrarGestionHorarios && (
                  <a href="/dashboard/gestion-horarios">Gestión Horarios</a>
                )}
              </div>
            </div>

            <div className={estilos.dropdown}>
              <button className={estilos.dropbtn}>Vacaciones ▼</button>
              <div className={estilos.dropdownContent}>
                <a href="/dashboard/vacaciones">Mi pacto de vacaciones</a>
              </div>
            </div>

            <a href="/dashboard/fichajes" className={estilos.dropbtn}>Fichajes</a>

            <a href="/dashboard/notificaciones" className={estilos.dropbtn}>
              Notificaciones
              {notifCount > 0 && (
                <span className={estilos.badgeNav}>{notifCount}</span>
              )}
            </a>

          </div>
        </div>

        {/* Botón hamburguesa para móvil */}
        <button
          className={estilos.menuHamburguesa}
          onClick={() => setMenuAbierto(abierto => !abierto)}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
        >
          ☰
        </button>

        {/* Email del usuario + Cerrar sesión */}
        <div className={estilos.navUsuario}>
          <div className={estilos.dropdown}>
            <button className={estilos.dropbtn}>{usuario.EMAIL} ▼</button>
            <div className={estilos.dropdownContentUser}>
              <a href="#" onClick={cerrarSesion}>Cerrar Sesión</a>
            </div>
          </div>
        </div>

      </nav>

      {/* menú móvil (se muestra/oculta con el botón hamburguesa)*/}
      {menuAbierto && (
        <div className={estilos.menuMovil}>
          <a href="/dashboard/mis-datos">Mis Datos</a>
          <a href="/dashboard/planificacion-semana">Semana Equipo</a>
          <a href="/dashboard/planificacion-mes">Mes Empleado/a</a>
          {mostrarGestionHorarios && (
            <a href="/dashboard/gestion-horarios">Gestión Horarios</a>
          )}
          <a href="/dashboard/vacaciones">Mi pacto de vacaciones</a>
          <a href="/dashboard/fichajes">Fichajes</a>
          <a href="/dashboard/notificaciones">
            Notificaciones{notifCount > 0 ? ` (${notifCount})` : ''}
          </a>
          <button onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      )}
    </>
  );
}
