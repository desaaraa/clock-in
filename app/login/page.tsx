// 1. "use client" le dice a Next.js que esta página necesita ser interactiva
// porque el usuario va a rellenar un formulario y pulsar botones.
"use client";

import React, { useState } from 'react';
import estilos from './login.module.css'; // Importamos el diseño css
import { redirect } from 'next/navigation';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

export default function PantallaDeLogin() {
  // 2. LA MEMORIA DE LA PÁGINA (useState)
  // Creamos dos variables para guardar lo que el usuario escriba en las cajas.
  // 'correoUsuario' y 'contrasenaUsuario' empiezan vacías ('').
  // Solo podemos cambiarlas usando las funciones 'setCorreoUsuario' y 'setContrasenaUsuario'.
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [contrasenaUsuario, setContrasenaUsuario] = useState('');

  const enrutador = useRouter(); // Esto nos permitirá cambiar de página después del login exitoso

  // 3. LA ACCIÓN DEL BOTÓN
  // Ponemos "async" porque la petición a internet tarda unos milisegundos y hay que esperar (await)
  const intentarIniciarSesion = async (evento: React.FormEvent) => {
    evento.preventDefault(); // Evita que el navegador recargue la página

    console.log("Enviando datos al servidor...");

    try {
      // Hacemos la petición POST a nuestra nueva API
      const respuesta = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Le decimos que le enviamos datos en formato JSON
        },
        body: JSON.stringify({
          email: correoUsuario,
          password: contrasenaUsuario,
        }), // Metemos las variables en la "mochila"
      });

      // Leemos lo que nos contesta el servidor (los NextResponse.json de antes)
      const datos = await respuesta.json();

      if (respuesta.ok) { 
        console.log("¡ÉXITO!", datos.mensaje);
        
        // 1. Guardamos los datos de Elena en la memoria del navegador (Local Storage)
        // Así las otras pantallas sabrán quién ha iniciado sesión
        localStorage.setItem('usuarioLogueado', JSON.stringify(datos.usuario));

        // 2. La enviamos volando a la pantalla del panel principal
        enrutador.push('/dashboard');
        
        // ¡Aquí en el futuro pondremos el código para llevarle a la pantalla principal!
      } else {
        // Si el status es 404 o 401 (Error)
        console.error("ERROR:", datos.mensaje);
        alert(datos.mensaje); // Muestra "Contraseña incorrecta" o "El usuario no existe"
      }

    } catch (error) {
      console.error("Fallo de conexión:", error);
      alert("No se ha podido conectar con el servidor.");
    }
  };

  // 4. LO QUE SE VE EN PANTALLA (El HTML)
  return (
    <div className={estilos.contenedorPrincipal}>

      {/* MITAD IZQUIERDA: La zona decorativa azul con mosaico */}
      <div className={estilos.ladoIzquierdo}>
        {/* Título y Texto (encima del fondo) */}
        <div className={estilos.contenidoIzquierdo}>
          <h1 className={estilos.tituloPrincipal}> Ready to start </h1>
          <h1 className={estilos.tituloPrincipal}>  your day? </h1>

        </div>

        {/* Contenedor del Mosaico de Imágenes */}
        <div className={estilos.contenedorMosaico}>
          {/* Imágenes del mosaico colocadas con CSS */}
          <div className={`${estilos.imagenMosaico} ${estilos.img1}`}></div>
          <div className={`${estilos.imagenMosaico} ${estilos.img2}`}></div>
          <div className={`${estilos.imagenMosaico} ${estilos.img3}`}></div>
          <div className={`${estilos.imagenMosaico} ${estilos.img4}`}></div>
          <div className={`${estilos.imagenMosaico} ${estilos.img6}`}></div>
          <div className={`${estilos.imagenMosaico} ${estilos.img7}`}></div>
          <div className={`${estilos.imagenMosaico} ${estilos.img8}`}></div>
        </div>
      </div>


      {/* MITAD DERECHA: La zona blanca con el formulario */}
      <div className={estilos.ladoDerecho}>
        <div className={estilos.cajaDelFormulario}>

          {/* Mensaje de bienvenida */}
          {/* Mensaje de bienvenida con Logo */}
          {/* Hemos añadido display: 'flex' y alignItems: 'center' para centrar el logo y el texto perfectamente */}
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* AÑADIMOS EL LOGO AQUÍ */}
            <Image
              src="/images/logoHornoDeOro.png" // La ruta exacta dentro de la carpeta public
              alt="Logo Horno de Oro" // Texto para lectores de pantalla (accesibilidad)
              width={120} // Anchura en píxeles (¡AJÚSTALO SI TE SALE MUY GRANDE O PEQUEÑO!)
              height={120} // Altura en píxeles (¡AJÚSTALO PARA QUE NO SE VEA ESTIRADO!)
              style={{ marginBottom: '1rem' }} // Un poquito de separación entre el logo y el texto de abajo
              priority // Le dice a Next.js que esta imagen es importante y debe cargar la primera
            />

            <p style={{ color: '#1f2937', fontSize: '1.1rem', fontWeight: '500' }}>¡Bienvenido de nuevo! </p>
          </div>

          {/* FORMULARIO: Al enviarse, lanza la función 'intentarIniciarSesion' */}
          <form onSubmit={intentarIniciarSesion}>

            {/* Caja para el Correo */}
            <div className={estilos.grupoDeInput}>
              <label className={estilos.etiqueta} htmlFor="correo">Correo Electrónico</label>
              <input
                id="correo"
                type="email"
                className={estilos.campoDeTexto}
                placeholder="ejemplo@empresa.com"
                value={correoUsuario} // Conectamos la caja a nuestra variable
                onChange={(evento) => setCorreoUsuario(evento.target.value)} // Guardamos cada letra que el usuario teclea
                required // Hace que sea obligatorio rellenarlo
              />
            </div>


            {/* Caja para la Contraseña */}
            <div className={estilos.grupoDeInput}>
              <label className={estilos.etiqueta} htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                className={estilos.campoDeTexto}
                placeholder="••••••••"
                value={contrasenaUsuario} // Conectamos la caja a nuestra variable
                onChange={(evento) => setContrasenaUsuario(evento.target.value)} // Guardamos cada letra tecleada
                required
              />
            </div>


            {/* Botón */}
            <button type="submit" className={estilos.botonDeEnviar}>
              Iniciar Sesión
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}