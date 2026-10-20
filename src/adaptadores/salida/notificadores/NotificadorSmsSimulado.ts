import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';
import type { ProveedorSmsFalso } from '../externos/ProveedorSmsFalso';

/**
 * PARTE 3 (adaptadores).
 * PATRÓN ADAPTER: Adapter. Traduce la acción a proveedor.sendMessage(numero, texto). Si la respuesta trae ok=false, lanzar un Error.
 */
export class NotificadorSmsSimulado implements Notificador {

  constructor(private readonly proveedor: ProveedorSmsFalso) {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    throw new Error('TODO PARTE 3: NotificadorSmsSimulado.enviar');
  }
}
