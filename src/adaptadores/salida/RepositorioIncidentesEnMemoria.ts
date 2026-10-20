import type { Incidente } from '../../dominio/incidente/Incidente';
import type { RepositorioIncidentes } from '../../aplicacion/puertos/salida/RepositorioIncidentes';

/**
 * PARTE 3 (adaptadores). Reemplaza a tire_alert_db: guarda los incidentes en un arreglo.
 * contarRecientes cuenta los del conductor con ocurridoEn >= desde (0 si no hay).
 */
export class RepositorioIncidentesEnMemoria implements RepositorioIncidentes {
  private readonly incidentes: Incidente[] = [];

  async guardar(incidente: Incidente): Promise<void> {
    throw new Error('TODO PARTE 3: RepositorioIncidentesEnMemoria.guardar');
  }

  async contarRecientes(conductorId: string, desde: Date): Promise<number> {
    throw new Error('TODO PARTE 3: RepositorioIncidentesEnMemoria.contarRecientes');
  }

  todos(): readonly Incidente[] {
    return this.incidentes;
  }
}
