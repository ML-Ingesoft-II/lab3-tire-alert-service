/**
 * Simula un proveedor de SMS externo (interfaz propia del proveedor).
 * PATRÓN ADAPTER: Adaptee. Ya está listo; no hace falta modificarlo.
 * fallosIniciales permite simular caídas temporales (útil para probar el Decorator).
 */
export class ProveedorSmsFalso {
  readonly enviados: { numero: string; texto: string }[] = [];

  constructor(private fallosIniciales = 0) {}

  async sendMessage(numero: string, texto: string): Promise<{ ok: boolean }> {
    if (this.fallosIniciales > 0) {
      this.fallosIniciales--;
      return { ok: false };
    }
    this.enviados.push({ numero, texto });
    console.log(`  [SMS] a ${numero}: ${texto}`);
    return { ok: true };
  }
}
