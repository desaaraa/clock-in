export const PUESTOS_GESTION_HORARIOS = [1, 2];

export const puedeGestionarHorarios = (puestoId: number | string | null | undefined) => {
  return PUESTOS_GESTION_HORARIOS.includes(Number(puestoId));
};
