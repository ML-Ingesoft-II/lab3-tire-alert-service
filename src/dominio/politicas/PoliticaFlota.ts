import { Canal, type AccionEscalamiento, type ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

export class PoliticaFlota implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    if (!contexto.flotaId || contexto.flotaId.trim() === '') {
      throw new Error('Fleet driver has no fleetId registered');
    }

    const locationInfo = incidente.ubicacion
      ? ` at (${incidente.ubicacion.latitud}, ${incidente.ubicacion.longitud})`
      : '';
    const message = `Fatigue alert: ${incidente.tipo} detected for fleet ${contexto.flotaId}${locationInfo}`;

    return [
      {
        canal: Canal.DASHBOARD,
        destinatario: contexto.flotaId,
        mensaje: message,
      },
    ];
  }
}

