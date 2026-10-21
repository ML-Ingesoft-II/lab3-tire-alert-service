import type { AccionEscalamiento, AlertaFatiga, Canal } from '../dominio/tipos';
import type { ReglasEscalamiento } from '../dominio/ReglasEscalamiento';
import type { ProcesarAlerta, ResultadoProceso } from './puertos/entrada/ProcesarAlerta';
import type { ConsultorPerfil } from './puertos/salida/ConsultorPerfil';
import type { RepositorioIncidentes } from './puertos/salida/RepositorioIncidentes';
import type { Notificador } from './puertos/salida/Notificador';
import type { FabricaPoliticas } from './FabricaPoliticas';
import { IncidenteBuilder } from '../dominio/incidente/IncidenteBuilder';

/**
 * Caso de uso principal. PATRÓN STRATEGY: Context.
 * Solo depende de interfaces (inversión de dependencias): todo se recibe por el constructor.
 */
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

    const fechaCorte = new Date(alerta.ocurridaEn.getTime() - this.reglas.ventanaMinutos * 60 * 1000);
    const incidentesRecientes = await this.repositorio.contarRecientes(alerta.conductorId, fechaCorte);

    if (incidentesRecientes > 0) {
      incidente.registrarRepeticion();
    }

    const debeEscalar = this.reglas.debeEscalar(incidente, incidentesRecientes);
    let acciones: AccionEscalamiento[] = [];

    try {
      if (debeEscalar) {
        const contexto = await this.perfiles.obtenerContexto(alerta.conductorId);
        const politica = this.fabrica.crearPara(contexto);
        acciones = politica.decidirAcciones(incidente, contexto);

        // Transición de estado a crítico antes de enviar para mantener consistencia ante fallos de red
        incidente.escalar(acciones);

        for (const accion of acciones) {
          const notificador = this.notificadores.get(accion.canal);
          if (!notificador) {
            throw new Error(`No hay notificador configurado para el canal: ${accion.canal}`);
          }
          await notificador.enviar(accion);
        }
      }
    } finally {
      // Registro inmutable obligatorio del incidente para auditoría y trazabilidad (AC06)
      await this.repositorio.guardar(incidente);
    }

    return {
      escalado: debeEscalar,
      nivel: incidente.nivel(),
      acciones,
    };
  }
}


