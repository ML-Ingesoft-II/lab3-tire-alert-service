import type { AccionEscalamiento, AlertaFatiga, NivelRiesgo } from '../../../dominio/tipos';

/** Resultado de procesar una alerta (útil para el controlador, la demo y las pruebas). */
export interface ResultadoProceso {
  escalado: boolean;
  nivel: NivelRiesgo;
  acciones: AccionEscalamiento[];
}

/** PUERTO DE ENTRADA: única operación que el exterior puede pedirle al servicio. */
export interface ProcesarAlerta {
  procesar(alerta: AlertaFatiga): Promise<ResultadoProceso>;
}
