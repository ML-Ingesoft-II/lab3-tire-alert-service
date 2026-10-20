import { Canal, type AccionEscalamiento, type ContextoConductor } from '../tipos';
import type { Incidente } from '../incidente/Incidente';
import type { PoliticaEscalamiento } from './PoliticaEscalamiento';

export class PoliticaFlota implements PoliticaEscalamiento {
  decidirAcciones(incidente: Incidente, contexto: ContextoConductor): AccionEscalamiento[] {
    if (!contexto.flotaId || contexto.flotaId.trim() === '') {
      throw new Error('El conductor de flota no tiene un flotaId registrado');
    }

    const textoUbicacion = incidente.ubicacion
      ? ` en (${incidente.ubicacion.latitud}, ${incidente.ubicacion.longitud})`
      : '';
    const mensaje = `Alerta de fatiga: ${incidente.tipo} detectado para la flota ${contexto.flotaId}${textoUbicacion}`;

    return [
      {
        canal: Canal.DASHBOARD,
        destinatario: contexto.flotaId,
        mensaje,
      },
    ];
  }
}


