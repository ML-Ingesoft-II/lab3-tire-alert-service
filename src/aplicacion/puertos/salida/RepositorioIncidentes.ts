import type { Incidente } from '../../../dominio/incidente/Incidente';

/** PUERTO DE SALIDA: registro de incidentes (tire_alert_db, AC06). */
export interface RepositorioIncidentes {
  guardar(incidente: Incidente): Promise<void>;
  /** Cantidad de incidentes del conductor ocurridos desde la fecha dada. Nunca null: 0 si no hay. */
  contarRecientes(conductorId: string, desde: Date): Promise<number>;
}
