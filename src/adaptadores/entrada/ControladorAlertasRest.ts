import { TipoEvento, type AlertaFatiga } from '../../dominio/tipos';
import type { ProcesarAlerta, ResultadoProceso } from '../../aplicacion/puertos/entrada/ProcesarAlerta';

/**
 * PARTE 4 (entrada y cierre). Adaptador de entrada.
 * Recibe el JSON tal como llegaría desde tire_api_gateway, lo valida, lo convierte
 * en AlertaFatiga y lo entrega al puerto ProcesarAlerta.
 * JSON esperado: { conductorId, tipo: "MICROSUENO" | "CABECEO", silenciada, ocurridaEn (ISO), ubicacion? }
 */
export class ControladorAlertasRest {
  constructor(private readonly casoDeUso: ProcesarAlerta) {}

  async recibirAlerta(json: unknown): Promise<ResultadoProceso> {
    // TODO PARTE 4: validar campos obligatorios (lanzar Error si faltan),
    // convertir 'ocurridaEn' a Date y 'tipo' a TipoEvento, y llamar a this.casoDeUso.procesar(alerta).
    throw new Error('TODO PARTE 4: ControladorAlertasRest.recibirAlerta');
  }
}

