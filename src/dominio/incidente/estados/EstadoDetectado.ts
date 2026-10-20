import { NivelRiesgo, type AccionEscalamiento } from '../../tipos';
import type { Incidente } from '../Incidente';
import type { EstadoIncidente } from './EstadoIncidente';

/**
 * PARTE 2 (incidente). PATRÓN STATE: estado concreto.
 * Nivel PRECAUCION. registrarRepeticion: no cambia de estado. escalar: guarda las acciones (incidente.agregarAcciones) y pasa a EstadoEscalado. atender: pasa a EstadoAtendido.
 */
export class EstadoDetectado implements EstadoIncidente {
  readonly nombre = 'Detectado';

  registrarRepeticion(incidente: Incidente): void {
    throw new Error('TODO PARTE 2: EstadoDetectado.registrarRepeticion');
  }

  escalar(incidente: Incidente, acciones: AccionEscalamiento[]): void {
    throw new Error('TODO PARTE 2: EstadoDetectado.escalar');
  }

  atender(incidente: Incidente): void {
    throw new Error('TODO PARTE 2: EstadoDetectado.atender');
  }

  nivel(): NivelRiesgo {
    throw new Error('TODO PARTE 2: EstadoDetectado.nivel');
  }
}
