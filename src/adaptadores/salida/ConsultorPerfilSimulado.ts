import type { ContextoConductor } from '../../dominio/tipos';
import type { ConsultorPerfil } from '../../aplicacion/puertos/salida/ConsultorPerfil';

/**
 * Reemplaza a tire_user_service / tire_fleet_service.
 * Busca el perfil en el mapa recibido; si no existe, lanza un Error.
 */
export class ConsultorPerfilSimulado implements ConsultorPerfil {
  constructor(private readonly perfiles: Map<string, ContextoConductor>) {}

  async obtenerContexto(conductorId: string): Promise<ContextoConductor> {
    const perfil = this.perfiles.get(conductorId);
    if (!perfil) {
      throw new Error(`No existe un perfil para el conductor ${conductorId}`);
    }
    return perfil;
  }
}
