import { NivelRiesgo, type AccionEscalamiento } from '../../tipos';
import type { Incidente } from '../Incidente';
import type { EstadoIncidente } from './EstadoIncidente';
import { EstadoAtendido } from './EstadoAtendido';

/**
 * PARTE 2 (incidente). PATRÓN STATE: estado concreto.
 * Nivel CRITICO. registrarRepeticion: no cambia de estado (solo se registra). escalar: agrega las nuevas acciones, sigue escalado. atender: pasa a EstadoAtendido.
 */
export class EstadoEscalado implements EstadoIncidente {
  readonly nombre = 'Escalado';

  registrarRepeticion(_incidente: Incidente): void {
    // Permanece en EstadoEscalado
  }

  escalar(incidente: Incidente, acciones: AccionEscalamiento[]): void {
    incidente.agregarAcciones(acciones);
  }

  atender(incidente: Incidente): void {
    incidente.cambiarEstado(new EstadoAtendido());
  }

  nivel(): NivelRiesgo {
    return NivelRiesgo.CRITICO;
  }
}
