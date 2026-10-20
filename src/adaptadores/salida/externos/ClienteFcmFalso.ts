/**
 * Simula el SDK de Firebase Cloud Messaging (NO es nuestro código: tiene su propia interfaz).
 * PATRÓN ADAPTER: Adaptee. Ya está listo; no hace falta modificarlo.
 */
export class ClienteFcmFalso {
  readonly enviados: { token: string; payload: { title: string; body: string } }[] = [];

  async send(token: string, payload: { title: string; body: string }): Promise<string> {
    this.enviados.push({ token, payload });
    console.log(`  [FCM] push a ${token}: ${payload.body}`);
    return `msg-${this.enviados.length}`;
  }
}
