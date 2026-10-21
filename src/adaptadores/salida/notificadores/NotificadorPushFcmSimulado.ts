import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';
import type { ClienteFcmFalso } from '../externos/ClienteFcmFalso';

/**
 * PATRÓN ADAPTER: Adapter. Traduce la acción a cliente.send(token, { title, body }), usando accion.destinatario como token.
 */
export class NotificadorPushFcmSimulado implements Notificador {
  constructor(private readonly cliente: ClienteFcmFalso) {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    await this.cliente.send(accion.destinatario, { title: 'Alerta de fatiga', body: accion.mensaje });
  }
}
