import type { AccionEscalamiento, NivelRiesgo } from '../../tipos';
import type { Incidente } from '../Incidente';

/**
 * PATRÓN STATE: interfaz State.
 * Cada estado decide qué hacer ante cada evento y a qué estado pasar
 * (llamando a incidente.cambiarEstado(...)).
 */
export interface EstadoIncidente {
  readonly nombre: string;
  registrarRepeticion(incidente: Incidente): void;
  escalar(incidente: Incidente, acciones: AccionEscalamiento[]): void;
  atender(incidente: Incidente): void;
  nivel(): NivelRiesgo;
}
