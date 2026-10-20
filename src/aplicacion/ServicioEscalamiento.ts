import type { AccionEscalamiento, AlertaFatiga, Canal } from '../dominio/tipos';
import type { ReglasEscalamiento } from '../dominio/ReglasEscalamiento';
import type { ProcesarAlerta, ResultadoProceso } from './puertos/entrada/ProcesarAlerta';
import type { ConsultorPerfil } from './puertos/salida/ConsultorPerfil';
import type { RepositorioIncidentes } from './puertos/salida/RepositorioIncidentes';
import type { Notificador } from './puertos/salida/Notificador';
import type { FabricaPoliticas } from './FabricaPoliticas';
import { IncidenteBuilder } from '../dominio/incidente/IncidenteBuilder';

export class ServicioEscalamiento implements ProcesarAlerta {
  constructor(
    private readonly perfiles: ConsultorPerfil,
    private readonly repositorio: RepositorioIncidentes,
    private readonly reglas: ReglasEscalamiento,
    private readonly fabrica: FabricaPoliticas,
    private readonly notificadores: Map<Canal, Notificador>,
  ) {}

  async procesar(alerta: AlertaFatiga): Promise<ResultadoProceso> {
    let builder = new IncidenteBuilder()
      .paraConductor(alerta.conductorId)
      .deTipo(alerta.tipo)
      .ocurridoEn(alerta.ocurridaEn)
      .silenciado(alerta.silenciada);

    if (alerta.ubicacion) {
      builder = builder.enUbicacion(alerta.ubicacion);
    }

    const incidente = builder.construir();

    const cutoffDate = new Date(alerta.ocurridaEn.getTime() - this.reglas.ventanaMinutos * 60 * 1000);
    const recentIncidentsCount = await this.repositorio.contarRecientes(alerta.conductorId, cutoffDate);

    if (recentIncidentsCount > 0) {
      incidente.registrarRepeticion();
    }

    const shouldEscalate = this.reglas.debeEscalar(incidente, recentIncidentsCount);
    let actions: AccionEscalamiento[] = [];

    try {
      if (shouldEscalate) {
        const context = await this.perfiles.obtenerContexto(alerta.conductorId);
        const policy = this.fabrica.crearPara(context);
        actions = policy.decidirAcciones(incidente, context);

        // Transition incident state before sending to maintain critical state even on network failure
        incidente.escalar(actions);

        for (const action of actions) {
          const notifier = this.notificadores.get(action.canal);
          if (!notifier) {
            throw new Error(`No notifier configured for channel: ${action.canal}`);
          }
          await notifier.enviar(action);
        }
      }
    } finally {
      // Always persist the incident to satisfy auditability and traceability requirements (AC06)
      await this.repositorio.guardar(incidente);
    }

    return {
      escalado: shouldEscalate,
      nivel: incidente.nivel(),
      acciones: actions,
    };
  }
}

