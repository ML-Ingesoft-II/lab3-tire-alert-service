import type { Incidente } from './incidente/Incidente';

/**
 * PARTE 1 (núcleo).
 * Decide CUÁNDO escalar. A quién avisar lo deciden las políticas (Strategy).
 */
export class ReglasEscalamiento {
  constructor(
    readonly ventanaMinutos: number = 10,
    readonly umbralRepeticiones: number = 3,
  ) {}

  /**
   * Se escala si la alarma NO fue silenciada, o si con esta alerta se alcanza
   * el umbral de repeticiones dentro de la ventana: recientes + 1 >= umbralRepeticiones.
   * @param recientes incidentes previos del mismo conductor dentro de la ventana
   */
  debeEscalar(incidente: Incidente, recientes: number): boolean {
    // TODO PARTE 1: implementar la regla descrita arriba.
    throw new Error('TODO PARTE 1: ReglasEscalamiento.debeEscalar');
  }
}
