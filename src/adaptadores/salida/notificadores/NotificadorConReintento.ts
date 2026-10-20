import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';

/**
 * PARTE 3 (adaptadores). PATRÓN DECORATOR: Decorator.
 * Envuelve a cualquier Notificador: llama a envuelto.enviar(accion) y, si lanza un Error,
 * lo vuelve a intentar hasta 'intentos' veces en total. Si todos fallan, relanza el último error.
 */
export class NotificadorConReintento implements Notificador {
  constructor(
    private readonly envuelto: Notificador,
    private readonly intentos: number = 3,
  ) {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    throw new Error('TODO PARTE 3: NotificadorConReintento.enviar');
  }
}
