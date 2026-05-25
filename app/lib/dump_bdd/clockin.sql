-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-05-2026 a las 18:32:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `clockin`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cambios_horario`
--

CREATE TABLE `cambios_horario` (
  `ID` int(11) NOT NULL,
  `EMPLEADO_ID` int(11) NOT NULL,
  `RESPONSABLE_ID` int(11) NOT NULL,
  `FECHA` date NOT NULL,
  `TURNO_CODIGO_ANTERIOR` varchar(5) DEFAULT NULL,
  `HORA_ENTRADA_ANTERIOR` time DEFAULT NULL,
  `HORA_SALIDA_ANTERIOR` time DEFAULT NULL,
  `NUEVOS_TURNOS` text NOT NULL,
  `ESTADO` varchar(20) NOT NULL DEFAULT 'PENDIENTE',
  `FECHA_SOLICITUD` datetime NOT NULL DEFAULT current_timestamp(),
  `FECHA_RESPUESTA` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cambios_horario`
--

INSERT INTO `cambios_horario` (`ID`, `EMPLEADO_ID`, `RESPONSABLE_ID`, `FECHA`, `TURNO_CODIGO_ANTERIOR`, `HORA_ENTRADA_ANTERIOR`, `HORA_SALIDA_ANTERIOR`, `NUEVOS_TURNOS`, `ESTADO`, `FECHA_SOLICITUD`, `FECHA_RESPUESTA`) VALUES
(1, 2, 1, '2026-05-02', 'X', '06:00:00', '14:00:00', '[{\"HORA_ENTRADA\":\"15:00:00\",\"HORA_SALIDA\":\"22:00:00\",\"TURNO_CODIGO\":\"X\"}]', 'ACEPTADO', '2026-05-12 12:54:54', '2026-05-12 12:56:07'),
(2, 2, 1, '2026-05-15', 'X', '13:00:00', '21:00:00', '[]', 'RECHAZADO', '2026-05-12 13:36:57', '2026-05-12 13:38:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `ID` int(11) NOT NULL,
  `DNI` varchar(20) NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `APELLIDOS` varchar(100) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `PUESTO_ID` int(11) DEFAULT NULL,
  `RESPONSABLE_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`ID`, `DNI`, `NOMBRE`, `APELLIDOS`, `EMAIL`, `PASSWORD`, `PUESTO_ID`, `RESPONSABLE_ID`) VALUES
(1, '10000000A', 'Elena', 'Navarro', 'elena.navarro@hornodeoro.com', '$2b$12$t6NybvpZY4ytoOm25/xMbOXPbsEES.MxUoG7qbUO9bHc9XrLWLWd.', 1, NULL),
(2, '20000001A', 'Carlos', 'Ruiz', 'carlos.ruiz@hornodeoro.com', '$2b$12$7Fl4jUgQIKI1A6hXV94SYO0B7x24M5qZu.UyZ3u0JnksN5Guicbum', 2, 1),
(3, '20000002A', 'Marta', 'Gómez', 'marta.gomez@hornodeoro.com', '$2b$12$qvFMi6WYhYf.JgEhMRbM0.WCVuqTPOGuQwcIOgmxXxGyF1/n17/fe', 2, 1),
(4, '20000003A', 'Luis', 'Fernández', 'luis.fernandez@hornodeoro.com', '$2b$12$4omQVIlR/yztheBF.Ft30OzxgICR2nOeUm/2jcgoWUQlpA0Lc0w/2', 2, 1),
(5, '20000004A', 'Ana', 'Martín', 'ana.martin@hornodeoro.com', '$2b$12$Ew9sOvrFcK7b2u9e9B/pue5jxl.qyEhmsbde9bMMZZVnpT7qKpvta', 2, 1),
(6, '20000005A', 'Jorge', 'Díaz', 'jorge.diaz@hornodeoro.com', '$2b$12$ajuFOXf.So38OLHwknfRiu7DI3cKmLcBUqCohYyRqZD.7vImfePTO', 2, 1),
(7, '30000001A', 'Sofía', 'López', 'sofia.lopez@hornodeoro.com', '$2b$12$JL/lL3WCclNTejiBadynaO0zO3lD9aZNRftBubIe1H4y0mz3ilLN2', 3, 1),
(8, '30000002A', 'Pedro', 'Sánchez', 'pedro.sanchez@hornodeoro.com', '$2b$12$6CjxC9CcZyqecZ9BpIMK9e5ii692qir7.dkpmQ2qjvIuiv8.1fQCq', 3, 1),
(9, '30000003A', 'Laura', 'Pérez', 'laura.perez@hornodeoro.com', '$2b$12$cVnvp/eTxNDCf4cbpL.KV.Mtc4TmezeiRaSHMZUsAU53Mrw9V6wwC', 3, 1),
(10, '30000004A', 'Miguel', 'García', 'miguel.garcia@hornodeoro.com', '$2b$12$jokBHIqWlDcNmKDzWukAOuZjYWHwyV81mJMtBls8gC5KLA.4zV9bK', 3, 1),
(11, '30000005A', 'Lucía', 'Romero', 'lucia.romero@hornodeoro.com', '$2b$12$pRIuf8E97g72eanSqxPXZe2TuwQb8Q2EUZmrX8VflBVpX9t65Zhu6', 3, 1),
(12, '40000001A', 'Javier', 'Muñoz', 'javier.munoz@hornodeoro.com', '$2b$12$6UL6HAVEn34I0M6P14pGDOm8iATCLb8FByOhUphS4B2LBy6W2HNxS', 4, 7),
(13, '40000002A', 'Isabel', 'Alonso', 'isabel.alonso@hornodeoro.com', '$2b$12$ULKxWPkkQryhic2vCvNr4e1n3VMm/PWzzfasW0fECs7U3XcMp57uW', 4, 7),
(14, '40000003A', 'Raúl', 'Torres', 'raul.torres@hornodeoro.com', '$2b$12$bhJeN6Z7n.dQ2eqkPwdj2OfWExCMguKNVgim5nHwJD3xGaDXOXi.u', 4, 7),
(15, '40000004A', 'Carmen', 'Domínguez', 'carmen.dominguez@hornodeoro.com', '$2b$12$5Ubnq7CMamIsTsE2JcYIx.QvevPQFXAiGCCXMVobg8yfl1aMFYYDi', 4, 7),
(16, '40000005A', 'Diego', 'Vázquez', 'diego.vazquez@hornodeoro.com', '$2b$12$yLsIwabWthEoqoO6vaENr.8CInWBX0luoprcv1GMSmow0/f58byNq', 4, 7),
(17, '50000001A', 'Antonio', 'Ramos', 'antonio.ramos@hornodeoro.com', '$2b$12$O6J4tkbGcxDx/KrSTmhCgOE04UiV6F03wI7V/xKUlY636hh8vxKQC', 5, 2),
(18, '50000002A', 'Beatriz', 'Gil', 'beatriz.gil@hornodeoro.com', '$2b$12$oBMbF8oY/kT9FbMy76aklO.Nfaz1EwBhLPGb/QN1EDyoQln/lDbYa', 5, 2),
(19, '50000003A', 'Manuel', 'Blanco', 'manuel.blanco@hornodeoro.com', '$2b$12$6l0eTLo81zpepLop.9MaCOGqtwT2O56.TKXpU4Ry0KfGsXr5aF5FC', 5, 2),
(20, '50000004A', 'Teresa', 'Iglesias', 'teresa.iglesias@hornodeoro.com', '$2b$12$Rz6.9ZP2ha/EANt.yF7B6uSSaeIAVtjTPMb64PkFXX9NaVXa9Oc5a', 5, 2),
(21, '50000005A', 'Rubén', 'Rubio', 'ruben.rubio@hornodeoro.com', '$2b$12$OGxtl4zN9Xg7bYi/HEpAfub7Zt0CA1yLbE8zoXuvtfpL2HAXywzvy', 5, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichajes`
--

CREATE TABLE `fichajes` (
  `ID` int(11) NOT NULL,
  `EMPLEADO_ID` int(11) NOT NULL,
  `FECHA_HORA_ENTRADA` datetime NOT NULL,
  `FECHA_HORA_SALIDA` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fichajes`
--

INSERT INTO `fichajes` (`ID`, `EMPLEADO_ID`, `FECHA_HORA_ENTRADA`, `FECHA_HORA_SALIDA`) VALUES
(1, 1, '2026-04-12 18:23:41', '2026-04-12 22:23:41'),
(2, 1, '2026-04-12 18:31:20', '2026-04-12 22:31:20'),
(3, 2, '2026-04-12 20:04:36', '2026-04-13 00:04:36'),
(4, 2, '2026-04-14 22:26:21', '2026-04-15 02:26:21'),
(5, 2, '2026-04-15 09:57:23', '2026-04-15 13:57:23'),
(6, 2, '2026-05-03 10:37:49', '2026-05-03 14:37:49'),
(7, 2, '2026-05-12 13:20:08', '2026-05-12 17:20:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `ID` int(11) NOT NULL,
  `EMPLEADO_ID` int(11) NOT NULL,
  `TIPO` varchar(50) NOT NULL,
  `TITULO` varchar(200) NOT NULL,
  `MENSAJE` text NOT NULL,
  `LEIDA` tinyint(1) NOT NULL DEFAULT 0,
  `FECHA_CREACION` datetime NOT NULL DEFAULT current_timestamp(),
  `REF_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`ID`, `EMPLEADO_ID`, `TIPO`, `TITULO`, `MENSAJE`, `LEIDA`, `FECHA_CREACION`, `REF_ID`) VALUES
(1, 2, 'CAMBIO_HORARIO', 'Propuesta de cambio de horario', 'Tu responsable propone cambiar tu horario del 2026-05-02. Turno actual: X (06:00 - 14:00). Nuevo turno propuesto: X (15:00:00 - 22:00:00). Acéptalo o recházalo desde Notificaciones.', 1, '2026-05-12 12:54:54', 1),
(2, 1, 'RESPUESTA_CAMBIO', 'Respuesta a cambio de horario', 'Tu empleado ha aceptado el cambio de horario del 2026-05-02.', 1, '2026-05-12 12:56:07', 1),
(3, 2, 'CAMBIO_HORARIO', 'Turno eliminado de tu horario', 'Tu responsable ha eliminado el turno X (14:00 - 22:00) del día 2026-05-15.', 1, '2026-05-12 13:25:41', NULL),
(4, 2, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (13:00 - 21:00) para el día 2026-05-15.', 1, '2026-05-12 13:25:43', NULL),
(5, 2, 'CAMBIO_HORARIO', 'Turno eliminado de tu horario', 'Tu responsable ha eliminado el turno X (13:30 - 21:00) del día 2026-05-12.', 1, '2026-05-12 13:31:07', NULL),
(6, 2, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (14:00 - 22:00) para el día 2026-05-12.', 1, '2026-05-12 13:31:10', NULL),
(7, 2, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', 'Tu responsable ha eliminado el turno X (13:00 - 21:00) del día 2026-05-15. Puedes aceptar la eliminación o rechazarla para restaurar el turno.', 1, '2026-05-12 13:36:57', 2),
(8, 2, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (14:00 - 22:00) para el día 2026-05-15.', 1, '2026-05-12 13:36:59', NULL),
(9, 1, 'RESPUESTA_CAMBIO', 'Respuesta a cambio de horario', 'Tu empleado ha rechazado el cambio de horario del 2026-05-15.', 0, '2026-05-12 13:38:01', 2),
(10, 17, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (08:00 - 15:00) para el día 2026-05-01.', 0, '2026-05-12 14:08:16', NULL),
(11, 17, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', 'Tu responsable ha eliminado el turno X (08:00 - 15:00) del día 2026-05-01.', 0, '2026-05-12 14:08:21', NULL),
(12, 21, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (08:00 - 14:00) para el día 2026-05-01.', 0, '2026-05-21 14:05:15', NULL),
(13, 21, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno P4 (08:30 - 14:00) para el día 2026-05-03.', 0, '2026-05-21 14:05:27', NULL),
(14, 17, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (07:30 - 08:00) para el día 2026-05-01.', 0, '2026-05-24 17:28:27', NULL),
(15, 17, 'CAMBIO_HORARIO', 'Tu responsable ha modificado tu horario', 'Tu responsable ha añadido el turno X (07:00 - 07:30) el día 2026-05-01.', 0, '2026-05-24 17:28:29', NULL),
(16, 17, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', 'Tu responsable ha eliminado el turno X (07:30 - 08:00) del día 2026-05-01.', 0, '2026-05-24 17:28:31', NULL),
(17, 17, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', 'Tu responsable ha eliminado el turno X (07:00 - 07:30) del día 2026-05-01.', 0, '2026-05-24 17:28:33', NULL),
(18, 17, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (07:00 - 07:30) para el día 2026-05-04.', 0, '2026-05-24 17:28:42', NULL),
(19, 17, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', 'Tu responsable ha eliminado el turno X (07:00 - 07:30) del día 2026-05-04.', 0, '2026-05-24 17:28:45', NULL),
(20, 19, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (10:00 - 21:00) para el día 2026-05-01.', 0, '2026-05-25 12:37:46', NULL),
(21, 19, 'CAMBIO_HORARIO', 'Nuevo turno asignado en tu horario', 'Tu responsable ha asignado el turno X (14:00 - 14:30) para el día 2026-05-02.', 0, '2026-05-25 12:38:15', NULL),
(22, 19, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', 'Tu responsable ha eliminado el turno X (14:00 - 14:30) del día 2026-05-02.', 0, '2026-05-25 12:38:18', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificaciones`
--

CREATE TABLE `planificaciones` (
  `ID` int(11) NOT NULL,
  `EMPLEADO_ID` int(11) NOT NULL,
  `FECHA` date NOT NULL,
  `HORA_ENTRADA` time DEFAULT NULL,
  `HORA_SALIDA` time DEFAULT NULL,
  `TURNO_CODIGO` varchar(5) DEFAULT 'X'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `planificaciones`
--

INSERT INTO `planificaciones` (`ID`, `EMPLEADO_ID`, `FECHA`, `HORA_ENTRADA`, `HORA_SALIDA`, `TURNO_CODIGO`) VALUES
(1, 2, '2026-03-23', '09:00:00', '17:00:00', 'X'),
(2, 2, '2026-03-24', '09:00:00', '17:00:00', 'X'),
(3, 2, '2026-03-25', '09:00:00', '17:00:00', 'X'),
(4, 2, '2026-03-26', '09:00:00', '17:00:00', 'X'),
(5, 2, '2026-03-27', '09:00:00', '17:00:00', 'X'),
(6, 3, '2026-03-23', '09:00:00', '17:00:00', 'X'),
(7, 3, '2026-03-24', '09:00:00', '17:00:00', 'X'),
(8, 3, '2026-03-25', '09:00:00', '17:00:00', 'X'),
(9, 3, '2026-03-26', '09:00:00', '17:00:00', 'X'),
(10, 3, '2026-03-27', '09:00:00', '17:00:00', 'X'),
(11, 4, '2026-03-23', '14:00:00', '22:00:00', 'X'),
(12, 4, '2026-03-24', '14:00:00', '22:00:00', 'X'),
(13, 4, '2026-03-25', '14:00:00', '22:00:00', 'X'),
(14, 4, '2026-03-26', '14:00:00', '22:00:00', 'X'),
(15, 4, '2026-03-27', '14:00:00', '22:00:00', 'X'),
(16, 5, '2026-03-23', '14:00:00', '22:00:00', 'X'),
(17, 5, '2026-03-24', '14:00:00', '22:00:00', 'X'),
(18, 5, '2026-03-25', '14:00:00', '22:00:00', 'X'),
(19, 5, '2026-03-26', '14:00:00', '22:00:00', 'X'),
(20, 5, '2026-03-27', '14:00:00', '22:00:00', 'X'),
(21, 6, '2026-03-23', '10:00:00', '18:00:00', 'X'),
(22, 6, '2026-03-24', '10:00:00', '18:00:00', 'X'),
(23, 6, '2026-03-25', '10:00:00', '18:00:00', 'X'),
(24, 6, '2026-03-26', '10:00:00', '18:00:00', 'X'),
(25, 6, '2026-03-27', '10:00:00', '18:00:00', 'X'),
(26, 2, '2025-11-05', '14:00:00', '18:00:00', 'X'),
(27, 2, '2025-11-05', '18:00:00', '20:00:00', 'C'),
(48, 2, '2026-04-06', '09:00:00', '17:00:00', 'X'),
(49, 2, '2026-04-07', '09:00:00', '17:00:00', 'X'),
(50, 2, '2026-04-08', '09:00:00', '17:00:00', 'X'),
(51, 2, '2026-04-09', '09:00:00', '17:00:00', 'X'),
(52, 2, '2026-04-10', '09:00:00', '17:00:00', 'X'),
(53, 2, '2026-04-13', '14:00:00', '22:00:00', 'X'),
(54, 2, '2026-04-14', '14:00:00', '22:00:00', 'X'),
(55, 2, '2026-04-15', '14:00:00', '18:00:00', 'X'),
(56, 2, '2026-04-15', '18:00:00', '20:00:00', 'C'),
(57, 2, '2026-04-16', '14:00:00', '22:00:00', 'X'),
(58, 2, '2026-04-17', '14:00:00', '22:00:00', 'X'),
(59, 2, '2026-04-20', '09:00:00', '15:00:00', 'V'),
(60, 2, '2026-04-21', '09:00:00', '15:00:00', 'V'),
(61, 2, '2026-04-22', '09:00:00', '15:00:00', 'V'),
(62, 2, '2026-04-23', '09:00:00', '15:00:00', 'V'),
(63, 2, '2026-04-24', '09:00:00', '15:00:00', 'V'),
(64, 2, '2026-04-27', '22:00:00', '05:00:00', 'N'),
(65, 2, '2026-04-28', '22:00:00', '05:00:00', 'N'),
(66, 2, '2026-04-29', '22:00:00', '05:00:00', 'N'),
(67, 3, '2026-04-13', '06:00:00', '14:00:00', 'X'),
(68, 4, '2026-04-13', '14:00:00', '22:00:00', 'X'),
(69, 5, '2026-04-13', '22:00:00', '06:00:00', 'N'),
(70, 3, '2026-04-14', '06:00:00', '14:00:00', 'X'),
(71, 4, '2026-04-14', '14:00:00', '22:00:00', 'X'),
(72, 5, '2026-04-14', '22:00:00', '06:00:00', 'N'),
(73, 3, '2026-04-15', '06:00:00', '14:00:00', 'X'),
(74, 4, '2026-04-15', '09:00:00', '17:00:00', 'V'),
(75, 5, '2026-04-15', '22:00:00', '06:00:00', 'N'),
(79, 2, '2026-05-03', '06:00:00', '14:00:00', 'F'),
(80, 2, '2026-05-04', '06:00:00', '14:00:00', 'X'),
(81, 2, '2026-05-05', '06:00:00', '14:00:00', 'X'),
(82, 2, '2026-05-06', '06:00:00', '14:00:00', 'X'),
(83, 2, '2026-05-07', '06:00:00', '14:00:00', 'X'),
(84, 2, '2026-05-08', '06:00:00', '14:00:00', 'X'),
(86, 2, '2026-05-11', '14:00:00', '22:00:00', 'X'),
(89, 2, '2026-05-16', '14:00:00', '22:00:00', 'X'),
(90, 2, '2026-05-17', '14:00:00', '22:00:00', 'F'),
(91, 2, '2026-05-19', '14:00:00', '22:00:00', 'F'),
(92, 2, '2026-05-20', '22:00:00', '06:00:00', 'N'),
(93, 2, '2026-05-21', '22:00:00', '06:00:00', 'N'),
(94, 2, '2026-05-24', '22:00:00', '06:00:00', 'F'),
(95, 2, '2026-05-25', '14:00:00', '22:00:00', 'V'),
(96, 2, '2026-05-26', '14:00:00', '22:00:00', 'V'),
(97, 2, '2026-05-27', '14:00:00', '22:00:00', 'V'),
(98, 2, '2026-05-28', '14:00:00', '22:00:00', 'V'),
(99, 2, '2026-05-29', '14:00:00', '22:00:00', 'V'),
(100, 3, '2026-05-01', '09:00:00', '16:00:00', 'X'),
(101, 3, '2026-05-02', '09:00:00', '16:00:00', 'X'),
(102, 3, '2026-05-05', '10:00:00', '17:00:00', 'X'),
(103, 3, '2026-05-06', '10:00:00', '17:00:00', 'X'),
(104, 3, '2026-05-07', '10:00:00', '17:00:00', 'X'),
(105, 3, '2026-05-08', '10:00:00', '17:00:00', 'X'),
(106, 3, '2026-05-09', '10:00:00', '17:00:00', 'X'),
(107, 3, '2026-05-11', '10:00:00', '17:00:00', 'X'),
(108, 3, '2026-05-12', '10:00:00', '17:00:00', 'X'),
(109, 3, '2026-05-15', '10:00:00', '17:00:00', 'X'),
(110, 3, '2026-05-16', '10:00:00', '17:00:00', 'X'),
(111, 3, '2026-05-18', '10:00:00', '17:00:00', 'X'),
(112, 3, '2026-05-19', '10:00:00', '17:00:00', 'X'),
(113, 3, '2026-05-20', '10:00:00', '17:00:00', 'X'),
(114, 3, '2026-05-21', '10:00:00', '17:00:00', 'X'),
(115, 3, '2026-05-22', '10:00:00', '17:00:00', 'X'),
(116, 3, '2026-05-25', '14:00:00', '21:00:00', 'X'),
(117, 3, '2026-05-26', '14:00:00', '21:00:00', 'X'),
(118, 3, '2026-05-27', '14:00:00', '21:00:00', 'X'),
(119, 3, '2026-05-28', '14:00:00', '21:00:00', 'X'),
(120, 3, '2026-05-29', '14:00:00', '21:00:00', 'X'),
(121, 11, '2026-05-01', '16:00:00', '22:00:00', 'X'),
(122, 11, '2026-05-02', '16:00:00', '22:00:00', 'X'),
(124, 11, '2026-05-03', '16:00:00', '22:00:00', 'F'),
(125, 11, '2026-05-04', '16:00:00', '22:00:00', 'X'),
(126, 11, '2026-05-05', '16:00:00', '22:00:00', 'X'),
(127, 11, '2026-05-06', '16:00:00', '22:00:00', 'X'),
(128, 11, '2026-05-07', '16:00:00', '22:00:00', 'X'),
(129, 11, '2026-05-08', '16:00:00', '22:00:00', 'X'),
(130, 11, '2026-05-11', '16:00:00', '22:00:00', 'X'),
(131, 11, '2026-05-12', '16:00:00', '22:00:00', 'X'),
(132, 11, '2026-05-13', '16:00:00', '22:00:00', 'X'),
(134, 11, '2026-05-15', '16:00:00', '22:00:00', 'X'),
(135, 11, '2026-05-14', '16:00:00', '22:00:00', 'X'),
(136, 11, '2026-05-18', '16:00:00', '22:00:00', 'X'),
(137, 11, '2026-05-19', '16:00:00', '22:00:00', 'X'),
(138, 11, '2026-05-20', '16:00:00', '22:00:00', 'X'),
(139, 11, '2026-05-21', '16:00:00', '22:00:00', 'X'),
(140, 11, '2026-05-22', '16:00:00', '22:00:00', 'X'),
(141, 11, '2026-05-25', '16:00:00', '22:00:00', 'X'),
(142, 11, '2026-05-26', '16:00:00', '22:00:00', 'X'),
(143, 11, '2026-05-27', '16:00:00', '22:00:00', 'X'),
(144, 11, '2026-05-28', '16:00:00', '22:00:00', 'X'),
(145, 11, '2026-05-29', '16:00:00', '22:00:00', 'X'),
(147, 4, '2026-05-01', '12:00:00', '18:00:00', 'X'),
(148, 4, '2026-05-02', '12:00:00', '18:00:00', 'X'),
(149, 4, '2026-05-04', '12:00:00', '18:00:00', 'X'),
(150, 4, '2026-05-05', '12:00:00', '18:00:00', 'X'),
(151, 4, '2026-05-06', '12:00:00', '18:00:00', 'X'),
(152, 4, '2026-05-07', '12:00:00', '18:00:00', 'X'),
(153, 4, '2026-05-08', '12:00:00', '18:00:00', 'X'),
(154, 4, '2026-05-11', '12:00:00', '18:00:00', 'X'),
(156, 4, '2026-05-13', '12:00:00', '18:00:00', 'X'),
(157, 4, '2026-05-14', '12:00:00', '18:00:00', 'X'),
(158, 4, '2026-05-15', '12:00:00', '18:00:00', 'X'),
(159, 4, '2026-05-18', '12:00:00', '18:00:00', 'X'),
(160, 4, '2026-05-20', '12:00:00', '18:00:00', 'X'),
(161, 4, '2026-05-21', '12:00:00', '18:00:00', 'X'),
(162, 4, '2026-05-23', '12:00:00', '18:00:00', 'X'),
(163, 4, '2026-05-25', '12:00:00', '18:00:00', 'X'),
(164, 4, '2026-05-26', '17:30:00', '23:30:00', 'X'),
(165, 4, '2026-05-27', '17:30:00', '23:30:00', 'X'),
(166, 4, '2026-05-28', '17:30:00', '23:30:00', 'X'),
(167, 4, '2026-05-29', '17:30:00', '23:30:00', 'X'),
(171, 2, '2026-05-02', '15:00:00', '22:00:00', 'X'),
(176, 2, '2026-05-12', '14:00:00', '22:00:00', 'X'),
(177, 2, '2026-05-15', '14:00:00', '22:00:00', 'X'),
(178, 2, '2026-05-15', '13:00:00', '21:00:00', 'X'),
(180, 21, '2026-05-01', '08:00:00', '14:00:00', 'X'),
(181, 21, '2026-05-03', '08:30:00', '14:00:00', 'P4'),
(185, 19, '2026-05-01', '10:00:00', '21:00:00', 'X');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puestos`
--

CREATE TABLE `puestos` (
  `ID` int(11) NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `DESCRIPCION` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `puestos`
--

INSERT INTO `puestos` (`ID`, `NOMBRE`, `DESCRIPCION`) VALUES
(1, 'Director de Logística', 'Control y verificación de la actividad del almacén'),
(2, 'Responsable de Logística', 'Gestión de operarios logísticos'),
(3, 'Responsable de Turno', 'Supervisa a los operarios en su franja horaria'),
(4, 'Preparador de Pedidos (Picker)', 'Prepara palets de harina, levadura y aditivos'),
(5, 'Carretillero', 'Manejo de toros mecánicos para ubicar palets');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE `turnos` (
  `CODIGO` varchar(5) NOT NULL,
  `DESCRIPCION` varchar(100) NOT NULL,
  `COLOR_HEX` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `turnos`
--

INSERT INTO `turnos` (`CODIGO`, `DESCRIPCION`, `COLOR_HEX`) VALUES
('A', 'Absentismo', '#ef4444'),
('B', 'Baja médica', '#f87171'),
('C', 'Complementaria', '#f97316'),
('D', 'Comp. Nocturna', '#1e293b'),
('F', 'Festivo', '#2563eb'),
('H', 'Comp. Festiva', '#ea580c'),
('I', 'Incapacidad laboral', '#fb7185'),
('J', 'Abs. justificado no retribuido', '#d1d5db'),
('M2', 'Formaciones', '#0ea5e9'),
('N', 'Nocturna', '#334155'),
('P0', 'Matrimonio', '#c084fc'),
('P1', 'Permiso por nacimiento', '#2dd4bf'),
('P13', 'Permiso Examen No Retribuido', '#6366f1'),
('P14', 'Permiso parental No Retribuido', '#818cf8'),
('P2', 'Maternidad', '#14b8a6'),
('P3', 'Paternidad', '#0d9488'),
('P4', 'Lactancia', '#5eead4'),
('P5', 'Permiso Mudanza', '#8b5cf6'),
('P6', 'Fallecimiento familiar', '#0f172a'),
('P7', 'Boda', '#d8b4fe'),
('P8', 'Hospitalización hasta 2º grado', '#94a3b8'),
('P9', 'Riesgo por embarazo', '#fcd34d'),
('Q', 'Falta puntualidad', '#991b1b'),
('R', 'Recuperación de horas', '#fde047'),
('S', 'Horas Sindicales', '#ec4899'),
('V', 'Vacaciones', '#16a34a'),
('W', 'Vacaciones por complementarias', '#84cc16'),
('X', 'Normal', '#a3e635');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacaciones`
--

CREATE TABLE `vacaciones` (
  `ID` int(11) NOT NULL,
  `EMPLEADO_ID` int(11) NOT NULL,
  `RESPONSABLE_ID` int(11) DEFAULT NULL,
  `ANIO` int(4) NOT NULL,
  `FECHA_INICIO` date NOT NULL,
  `FECHA_FIN` date NOT NULL,
  `ESTADO` varchar(20) NOT NULL DEFAULT 'PENDIENTE',
  `FECHA_SOLICITUD` datetime NOT NULL DEFAULT current_timestamp(),
  `FECHA_VALIDACION` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacaciones`
--

INSERT INTO `vacaciones` (`ID`, `EMPLEADO_ID`, `RESPONSABLE_ID`, `ANIO`, `FECHA_INICIO`, `FECHA_FIN`, `ESTADO`, `FECHA_SOLICITUD`, `FECHA_VALIDACION`) VALUES
(1, 2, 1, 2026, '2026-05-18', '2026-05-22', 'APROBADA', '2026-05-12 12:11:58', '2026-05-12 12:13:20'),
(2, 2, 1, 2026, '2026-05-26', '2026-05-29', 'APROBADA', '2026-05-12 12:12:28', '2026-05-12 12:13:23');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cambios_horario`
--
ALTER TABLE `cambios_horario`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `EMPLEADO_ID` (`EMPLEADO_ID`),
  ADD KEY `fk_cambio_responsable` (`RESPONSABLE_ID`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `DNI` (`DNI`),
  ADD UNIQUE KEY `EMAIL` (`EMAIL`),
  ADD KEY `PUESTO_ID` (`PUESTO_ID`),
  ADD KEY `RESPONSABLE_ID` (`RESPONSABLE_ID`);

--
-- Indices de la tabla `fichajes`
--
ALTER TABLE `fichajes`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `EMPLEADO_ID` (`EMPLEADO_ID`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `EMPLEADO_ID` (`EMPLEADO_ID`);

--
-- Indices de la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `EMPLEADO_ID` (`EMPLEADO_ID`),
  ADD KEY `TURNO_CODIGO` (`TURNO_CODIGO`);

--
-- Indices de la tabla `puestos`
--
ALTER TABLE `puestos`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD PRIMARY KEY (`CODIGO`);

--
-- Indices de la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `EMPLEADO_ID` (`EMPLEADO_ID`),
  ADD KEY `RESPONSABLE_ID` (`RESPONSABLE_ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cambios_horario`
--
ALTER TABLE `cambios_horario`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `fichajes`
--
ALTER TABLE `fichajes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT de la tabla `puestos`
--
ALTER TABLE `puestos`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cambios_horario`
--
ALTER TABLE `cambios_horario`
  ADD CONSTRAINT `fk_cambio_responsable` FOREIGN KEY (`RESPONSABLE_ID`) REFERENCES `empleados` (`ID`);

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`PUESTO_ID`) REFERENCES `puestos` (`ID`),
  ADD CONSTRAINT `empleados_ibfk_2` FOREIGN KEY (`RESPONSABLE_ID`) REFERENCES `empleados` (`ID`);

--
-- Filtros para la tabla `fichajes`
--
ALTER TABLE `fichajes`
  ADD CONSTRAINT `fichajes_ibfk_1` FOREIGN KEY (`EMPLEADO_ID`) REFERENCES `empleados` (`ID`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_noti_empleado` FOREIGN KEY (`EMPLEADO_ID`) REFERENCES `empleados` (`ID`);

--
-- Filtros para la tabla `planificaciones`
--
ALTER TABLE `planificaciones`
  ADD CONSTRAINT `fk_plan_empleado` FOREIGN KEY (`EMPLEADO_ID`) REFERENCES `empleados` (`ID`),
  ADD CONSTRAINT `planificaciones_ibfk_1` FOREIGN KEY (`EMPLEADO_ID`) REFERENCES `empleados` (`ID`),
  ADD CONSTRAINT `planificaciones_ibfk_2` FOREIGN KEY (`TURNO_CODIGO`) REFERENCES `turnos` (`CODIGO`);

--
-- Filtros para la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  ADD CONSTRAINT `fk_vac_empleado` FOREIGN KEY (`EMPLEADO_ID`) REFERENCES `empleados` (`ID`),
  ADD CONSTRAINT `fk_vac_responsable` FOREIGN KEY (`RESPONSABLE_ID`) REFERENCES `empleados` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
