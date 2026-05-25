export const formatearFechaLocal = (fecha: Date) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

export const normalizarFechaISO = (fecha: string) => {
  return fecha.split('T')[0];
};

export const crearFechaLocalDesdeISO = (fecha: string) => {
  const [anio, mes, dia] = normalizarFechaISO(fecha).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
};

export const obtenerIndiceDiaLunes = (fecha: Date) => {
  return (fecha.getDay() + 6) % 7;
};

export const obtenerInicioSemanaLunes = (fecha: Date) => {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - obtenerIndiceDiaLunes(inicio));
  return inicio;
};

export const obtenerFinSemanaDomingo = (fecha: Date) => {
  const fin = obtenerInicioSemanaLunes(fecha);
  fin.setDate(fin.getDate() + 6);
  return fin;
};

export const agruparDiasMesPorSemanas = (anio: number, mes: number) => {
  const semanas = new Map<string, string[]>();
  const diasMes = new Date(anio, mes + 1, 0).getDate();

  for (let i = 1; i <= diasMes; i++) {
    const fecha = new Date(anio, mes, i);
    const claveSemana = formatearFechaLocal(obtenerInicioSemanaLunes(fecha));

    if (!semanas.has(claveSemana)) {
      semanas.set(claveSemana, []);
    }

    semanas.get(claveSemana)?.push(formatearFechaLocal(fecha));
  }

  return Array.from(semanas.entries()).map(([inicio, fechas], indice) => ({
    id: inicio,
    indice: indice + 1,
    fechas,
  }));
};

export const calcularHorasEntre = (entrada: string, salida: string) => {
  if (!entrada || !salida) return 0;

  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);

  const inicio = hE * 60 + mE;
  let fin = hS * 60 + mS;

  if (fin <= inicio) {
    fin += 24 * 60;
  }

  return (fin - inicio) / 60;
};

export const sumarHorasTurnos = <T extends { HORA_ENTRADA: string; HORA_SALIDA: string }>(turnos: T[]) => {
  return turnos.reduce((total, turno) => total + calcularHorasEntre(turno.HORA_ENTRADA, turno.HORA_SALIDA), 0);
};
