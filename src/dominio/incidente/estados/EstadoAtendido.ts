import { NivelRiesgo, type AccionEscalamiento } from '../../tipos';
import type { Incidente } from '../Incidente';
import type { EstadoIncidente } from './EstadoIncidente';

/**
 * PARTE 2 (incidente). PATRÓN STATE: estado concreto.
 * Nivel NORMAL. registrarRepeticion y escalar: no hacen nada (no se vuelve a notificar). atender: no hace nada.
 */
export class EstadoAtendido implements EstadoIncidente {
  readonly nombre = 'Atendido';

  registrarRepeticion(_incidente: Incidente): void {
    // Estado terminal: no altera el incidente
  }

  escalar(_incidente: Incidente, _acciones: AccionEscalamiento[]): void {
    // Estado terminal: ignora nuevos intentos de escalamiento
  }

  atender(_incidente: Incidente): void {
    // Estado terminal: ya se encuentra atendido
  }

  nivel(): NivelRiesgo {
    return NivelRiesgo.NORMAL;
  }
}
