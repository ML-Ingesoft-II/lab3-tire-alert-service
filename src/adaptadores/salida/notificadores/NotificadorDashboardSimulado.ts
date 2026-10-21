import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';

/**
 * Simula la publicación en el dashboard del despachador: guarda la acción en 'publicadas' y la muestra por consola.
 */
export class NotificadorDashboardSimulado implements Notificador {
  readonly publicadas: AccionEscalamiento[] = [];

  async enviar(accion: AccionEscalamiento): Promise<void> {
    this.publicadas.push(accion);
    console.log(`  [DASHBOARD] a ${accion.destinatario}: ${accion.mensaje}`);
  }
}
