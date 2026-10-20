import type { Incidente } from './incidente/Incidente';

export class ReglasEscalamiento {
  constructor(
    readonly ventanaMinutos: number = 10,
    readonly umbralRepeticiones: number = 3,
  ) {}

  /**
   * Evaluates if escalation is required: when the alarm was not silenced,
   * or when repeated occurrences reach the threshold within the configured time window.
   */
  debeEscalar(incidente: Incidente, recientes: number): boolean {
    return !incidente.silenciado || recientes + 1 >= this.umbralRepeticiones;
  }
}

