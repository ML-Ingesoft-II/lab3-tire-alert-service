import { Canal, TipoPerfil, type ContextoConductor } from '../dominio/tipos';
import { ReglasEscalamiento } from '../dominio/ReglasEscalamiento';
import { FabricaPoliticas } from '../aplicacion/FabricaPoliticas';
import { ServicioEscalamiento } from '../aplicacion/ServicioEscalamiento';
import type { Notificador } from '../aplicacion/puertos/salida/Notificador';
import { ConsultorPerfilSimulado } from '../adaptadores/salida/ConsultorPerfilSimulado';
import { RepositorioIncidentesEnMemoria } from '../adaptadores/salida/RepositorioIncidentesEnMemoria';
import { NotificadorPushFcmSimulado } from '../adaptadores/salida/notificadores/NotificadorPushFcmSimulado';
import { NotificadorSmsSimulado } from '../adaptadores/salida/notificadores/NotificadorSmsSimulado';
import { NotificadorDashboardSimulado } from '../adaptadores/salida/notificadores/NotificadorDashboardSimulado';
import { NotificadorConReintento } from '../adaptadores/salida/notificadores/NotificadorConReintento';
import { ClienteFcmFalso } from '../adaptadores/salida/externos/ClienteFcmFalso';
import { ProveedorSmsFalso } from '../adaptadores/salida/externos/ProveedorSmsFalso';

/**
 * Punto de ensamblaje: el ÚNICO lugar que conoce las clases concretas.
 * Ya está listo; solo se modifica para agregar un perfil de prueba o un canal nuevo.
 */
export const PERFILES_DEMO: ContextoConductor[] = [
  { conductorId: 'c-solo', tipoPerfil: TipoPerfil.PARTICULAR_SOLO, contactosEmergencia: ['+573001112233', '+573004445566'] },
  { conductorId: 'c-copiloto', tipoPerfil: TipoPerfil.PARTICULAR_CON_COPILOTO, contactosEmergencia: ['+573007778899'], copilotoId: 'token-copiloto-01' },
  { conductorId: 'c-flota', tipoPerfil: TipoPerfil.FLOTA, contactosEmergencia: [], flotaId: 'flota-transandina' },
];

export function crearServicio(): ServicioEscalamiento {
  const perfiles = new ConsultorPerfilSimulado(new Map(PERFILES_DEMO.map((p) => [p.conductorId, p])));
  const notificadores = new Map<Canal, Notificador>([
    [Canal.PUSH, new NotificadorConReintento(new NotificadorPushFcmSimulado(new ClienteFcmFalso()))],
    [Canal.SMS, new NotificadorConReintento(new NotificadorSmsSimulado(new ProveedorSmsFalso(1)))],
    [Canal.DASHBOARD, new NotificadorDashboardSimulado()],
  ]);
  return new ServicioEscalamiento(
    perfiles,
    new RepositorioIncidentesEnMemoria(),
    new ReglasEscalamiento(10, 3),
    new FabricaPoliticas(),
    notificadores,
  );
}
