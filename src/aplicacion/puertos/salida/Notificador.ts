import type { AccionEscalamiento } from '../../../dominio/tipos';

/**
 * PUERTO DE SALIDA común a los tres canales (push, SMS, dashboard).
 * PATRÓN ADAPTER: es el Target. PATRÓN DECORATOR: es el Component.
 * Debe lanzar un Error si el envío falla.
 */
export interface Notificador {
  enviar(accion: AccionEscalamiento): Promise<void>;
}
