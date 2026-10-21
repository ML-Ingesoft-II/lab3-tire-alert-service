import type { Incidente } from '../../dominio/incidente/Incidente';
import type { RepositorioIncidentes } from '../../aplicacion/puertos/salida/RepositorioIncidentes';

/**
 * Reemplaza a tire_alert_db: guarda los incidentes en un arreglo.
 * contarRecientes cuenta los del conductor con ocurridoEn >= desde (0 si no hay).
 */
export class RepositorioIncidentesEnMemoria implements RepositorioIncidentes {
  private readonly incidentes: Incidente[] = [];

  async guardar(incidente: Incidente): Promise<void> {
    this.incidentes.push(incidente);
  }

  async contarRecientes(conductorId: string, desde: Date): Promise<number> {
    return this.incidentes.filter(
      (incidente) => incidente.conductorId === conductorId && incidente.ocurridoEn >= desde,
    ).length;
  }

  todos(): readonly Incidente[] {
    return this.incidentes;
  }
}
