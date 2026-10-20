import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';


/**
 * PARTE 3 (adaptadores).
 * Simula la publicación en el dashboard del despachador: guarda la acción en 'publicadas' y la muestra por consola.
 */
export class NotificadorDashboardSimulado implements Notificador {
  readonly publicadas: AccionEscalamiento[] = [];
  constructor() {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    throw new Error('TODO PARTE 3: NotificadorDashboardSimulado.enviar');
  }
}
