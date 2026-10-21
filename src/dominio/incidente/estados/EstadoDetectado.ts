import { NivelRiesgo, type AccionEscalamiento } from '../../tipos';
import type { Incidente } from '../Incidente';
import type { EstadoIncidente } from './EstadoIncidente';
import { EstadoAtendido } from './EstadoAtendido';
import { EstadoEscalado } from './EstadoEscalado';

/**
 * PARTE 2 (incidente). PATRÓN STATE: estado concreto.
 * Nivel PRECAUCION. registrarRepeticion: no cambia de estado. escalar: guarda las acciones (incidente.agregarAcciones) y pasa a EstadoEscalado. atender: pasa a EstadoAtendido.
 */
export class EstadoDetectado implements EstadoIncidente {
  readonly nombre = 'Detectado';

  registrarRepeticion(_incidente: Incidente): void {
    // Permanece en EstadoDetectado
  }

  escalar(incidente: Incidente, acciones: AccionEscalamiento[]): void {
    incidente.agregarAcciones(acciones);
    incidente.cambiarEstado(new EstadoEscalado());
  }

  atender(incidente: Incidente): void {
    incidente.cambiarEstado(new EstadoAtendido());
  }

  nivel(): NivelRiesgo {
    return NivelRiesgo.PRECAUCION;
  }
}
