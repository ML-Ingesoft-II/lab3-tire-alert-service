import { NivelRiesgo, type AccionEscalamiento } from '../../tipos';
import type { Incidente } from '../Incidente';
import type { EstadoIncidente } from './EstadoIncidente';

/**
 * PARTE 2 (incidente). PATRÓN STATE: estado concreto.
 * Nivel CRITICO. registrarRepeticion: no cambia de estado (solo se registra). escalar: agrega las nuevas acciones, sigue escalado. atender: pasa a EstadoAtendido.
 */
export class EstadoEscalado implements EstadoIncidente {
  readonly nombre = 'Escalado';

  registrarRepeticion(incidente: Incidente): void {
    throw new Error('TODO PARTE 2: EstadoEscalado.registrarRepeticion');
  }

  escalar(incidente: Incidente, acciones: AccionEscalamiento[]): void {
    throw new Error('TODO PARTE 2: EstadoEscalado.escalar');
  }

  atender(incidente: Incidente): void {
    throw new Error('TODO PARTE 2: EstadoEscalado.atender');
  }

  nivel(): NivelRiesgo {
    throw new Error('TODO PARTE 2: EstadoEscalado.nivel');
  }
}
