import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';
import type { ClienteFcmFalso } from '../externos/ClienteFcmFalso';

/**
 * PARTE 3 (adaptadores).
 * PATRÓN ADAPTER: Adapter. Traduce la acción a cliente.send(token, { title, body }), usando accion.destinatario como token.
 */
export class NotificadorPushFcmSimulado implements Notificador {

  constructor(private readonly cliente: ClienteFcmFalso) {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    throw new Error('TODO PARTE 3: NotificadorPushFcmSimulado.enviar');
  }
}
