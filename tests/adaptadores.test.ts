import { describe, it } from 'vitest';

// PARTE 3 (adaptadores): Adapter (FCM, SMS), Decorator (reintento), repositorio y perfiles simulados.
describe('Parte 3 – adaptadores', () => {
  it.todo('NotificadorSmsSimulado traduce la acción a sendMessage(numero, texto)');
  it.todo('NotificadorConReintento reintenta hasta lograr el envío cuando el proveedor falla temporalmente');
  it.todo('NotificadorConReintento relanza el error si fallan todos los intentos');
  it.todo('RepositorioIncidentesEnMemoria cuenta solo los incidentes del conductor dentro de la ventana');
});
