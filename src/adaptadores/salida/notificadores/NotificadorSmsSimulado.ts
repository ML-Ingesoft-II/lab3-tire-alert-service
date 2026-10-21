import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';
import type { ProveedorSmsFalso } from '../externos/ProveedorSmsFalso';

/**
 * PATRÓN ADAPTER: Adapter. Traduce la acción a proveedor.sendMessage(numero, texto). Si la respuesta trae ok=false, lanza un Error.
 */
export class NotificadorSmsSimulado implements Notificador {
  constructor(private readonly proveedor: ProveedorSmsFalso) {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    const respuesta = await this.proveedor.sendMessage(accion.destinatario, accion.mensaje);
    if (!respuesta.ok) {
      throw new Error(`El proveedor de SMS no pudo enviar el mensaje a ${accion.destinatario}`);
    }
  }
}
