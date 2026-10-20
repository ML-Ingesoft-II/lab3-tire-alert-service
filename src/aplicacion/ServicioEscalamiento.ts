import type { AlertaFatiga, Canal } from '../dominio/tipos';
import type { ReglasEscalamiento } from '../dominio/ReglasEscalamiento';
import type { ProcesarAlerta, ResultadoProceso } from './puertos/entrada/ProcesarAlerta';
import type { ConsultorPerfil } from './puertos/salida/ConsultorPerfil';
import type { RepositorioIncidentes } from './puertos/salida/RepositorioIncidentes';
import type { Notificador } from './puertos/salida/Notificador';
import type { FabricaPoliticas } from './FabricaPoliticas';

/**
 * PARTE 1 (núcleo). Caso de uso principal. PATRÓN STRATEGY: Context.
 * Solo depende de interfaces (inversión de dependencias): todo se recibe por el constructor.
 *
 * Flujo de procesar(alerta):
 *  1. Crear el Incidente con IncidenteBuilder (datos de la alerta).
 *  2. Contar incidentes recientes del conductor dentro de reglas.ventanaMinutos
 *     (antes de guardar: el conteo no incluye esta alerta). Si recientes > 0, incidente.registrarRepeticion().
 *  3. Si reglas.debeEscalar(...):
 *     a. obtener el contexto con perfiles.obtenerContexto(...)
 *     b. politica = fabrica.crearPara(contexto); acciones = politica.decidirAcciones(...)
 *     c. incidente.escalar(acciones) ANTES de enviar: el incidente queda crítico aunque un envío falle.
 *     d. enviar cada acción con notificadores.get(accion.canal); si no hay notificador para ese canal, lanzar un Error.
 *  4. Guardar el incidente en el repositorio SIEMPRE, aunque algo falle en el paso 3 (try/finally),
 *     porque cada incidente debe quedar registrado (AC06). El error, si lo hubo, se propaga.
 *  5. Devolver { escalado, nivel: incidente.nivel(), acciones } (acciones = [] si no se escaló).
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
    throw new Error('TODO PARTE 1: ServicioEscalamiento.procesar');
  }
}
