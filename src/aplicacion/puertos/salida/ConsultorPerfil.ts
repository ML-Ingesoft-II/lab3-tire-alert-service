import type { ContextoConductor } from '../../../dominio/tipos';

/** PUERTO DE SALIDA: perfil del conductor (tire_user_service / tire_fleet_service). */
export interface ConsultorPerfil {
  obtenerContexto(conductorId: string): Promise<ContextoConductor>;
}
