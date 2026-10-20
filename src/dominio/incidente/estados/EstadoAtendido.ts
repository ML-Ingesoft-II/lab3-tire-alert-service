import { NivelRiesgo, type AccionEscalamiento } from '../../tipos';
import type { Incidente } from '../Incidente';
import type { EstadoIncidente } from './EstadoIncidente';

/**
 * PARTE 2 (incidente). PATRÓN STATE: estado concreto.
 * Nivel NORMAL. registrarRepeticion y escalar: no hacen nada (no se vuelve a notificar). atender: no hace nada.
 */
export class EstadoAtendido implements EstadoIncidente {
  readonly nombre = 'Atendido';

  registrarRepeticion(incidente: Incidente): void {
    throw new Error('TODO PARTE 2: EstadoAtendido.registrarRepeticion');
  }

  escalar(incidente: Incidente, acciones: AccionEscalamiento[]): void {
    throw new Error('TODO PARTE 2: EstadoAtendido.escalar');
  }

  atender(incidente: Incidente): void {
    throw new Error('TODO PARTE 2: EstadoAtendido.atender');
  }

  nivel(): NivelRiesgo {
    throw new Error('TODO PARTE 2: EstadoAtendido.nivel');
  }
}
