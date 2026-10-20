import type { Incidente } from './incidente/Incidente';

export class ReglasEscalamiento {
  constructor(
    readonly ventanaMinutos: number = 10,
    readonly umbralRepeticiones: number = 3,
  ) {}

  /**
   * Evalúa si se debe escalar: cuando la alarma no fue silenciada en cabina,
   * o cuando las repeticiones dentro de la ventana temporal alcanzan el umbral.
   */
  debeEscalar(incidente: Incidente, recientes: number): boolean {
    return !incidente.silenciado || recientes + 1 >= this.umbralRepeticiones;
  }
}


