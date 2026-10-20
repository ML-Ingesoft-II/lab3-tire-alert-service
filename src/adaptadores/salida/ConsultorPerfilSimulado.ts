import type { ContextoConductor } from '../../dominio/tipos';
import type { ConsultorPerfil } from '../../aplicacion/puertos/salida/ConsultorPerfil';

/**
 * PARTE 3 (adaptadores). Reemplaza a tire_user_service / tire_fleet_service.
 * Busca el perfil en el mapa recibido; si no existe, lanza un Error.
 */
export class ConsultorPerfilSimulado implements ConsultorPerfil {
  constructor(private readonly perfiles: Map<string, ContextoConductor>) {}

  async obtenerContexto(conductorId: string): Promise<ContextoConductor> {
    throw new Error('TODO PARTE 3: ConsultorPerfilSimulado.obtenerContexto');
  }
}
