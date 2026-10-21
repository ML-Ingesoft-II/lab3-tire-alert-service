import type { AccionEscalamiento } from '../../../dominio/tipos';
import type { Notificador } from '../../../aplicacion/puertos/salida/Notificador';

/**
 * PATRÓN DECORATOR: Decorator.
 * Envuelve a cualquier Notificador: llama a envuelto.enviar(accion) y, si lanza un Error,
 * lo vuelve a intentar hasta 'intentos' veces en total. Si todos fallan, relanza el último error.
 */
export class NotificadorConReintento implements Notificador {
  constructor(
    private readonly envuelto: Notificador,
    private readonly intentos: number = 3,
  ) {}

  async enviar(accion: AccionEscalamiento): Promise<void> {
    let ultimoError: unknown;
    for (let intento = 1; intento <= Math.max(1, this.intentos); intento++) {
      try {
        await this.envuelto.enviar(accion);
        return;
      } catch (error) {
        ultimoError = error;
      }
    }
    throw ultimoError;
  }
}
