import { describe, expect, it } from 'vitest';
import { Canal, NivelRiesgo, TipoEvento, type AccionEscalamiento } from '../src/dominio/tipos';
import { IncidenteBuilder } from '../src/dominio/incidente/IncidenteBuilder';

// State (estados del incidente) y Builder.
describe('Parte 2 – incidente', () => {
  it('IncidenteBuilder construye un incidente en estado Detectado con nivel PRECAUCION', () => {
    const fecha = new Date('2026-10-20T12:00:00Z');
    const incidente = new IncidenteBuilder()
      .paraConductor('c-01')
      .deTipo(TipoEvento.MICROSUENO)
      .ocurridoEn(fecha)
      .construir();

    expect(incidente.conductorId).toBe('c-01');
    expect(incidente.tipo).toBe(TipoEvento.MICROSUENO);
    expect(incidente.ocurridoEn).toBe(fecha);
    expect(incidente.silenciado).toBe(false);
    expect(incidente.ubicacion).toBeUndefined();
    expect(incidente.nombreEstado).toBe('Detectado');
    expect(incidente.nivel()).toBe(NivelRiesgo.PRECAUCION);
    expect(incidente.historialAcciones).toEqual([]);
  });

  it('IncidenteBuilder lanza un error si falta el conductor, el tipo o la fecha', () => {
    const fecha = new Date('2026-10-20T12:00:00Z');

    // Falta conductorId
    expect(() =>
      new IncidenteBuilder().deTipo(TipoEvento.MICROSUENO).ocurridoEn(fecha).construir(),
    ).toThrow();

    // Falta tipo
    expect(() =>
      new IncidenteBuilder().paraConductor('c-01').ocurridoEn(fecha).construir(),
    ).toThrow();

    // Falta fecha
    expect(() =>
      new IncidenteBuilder().paraConductor('c-01').deTipo(TipoEvento.CABECEO).construir(),
    ).toThrow();
  });

  it('Un incidente detectado pasa a Escalado (nivel CRITICO) al escalar', () => {
    const incidente = new IncidenteBuilder()
      .paraConductor('c-01')
      .deTipo(TipoEvento.MICROSUENO)
      .ocurridoEn(new Date('2026-10-20T12:00:00Z'))
      .enUbicacion({ latitud: 4.65, longitud: -74.06 })
      .silenciado(false)
      .construir();

    const accion: AccionEscalamiento = {
      canal: Canal.SMS,
      destinatario: '+573001112233',
      mensaje: 'Alerta de fatiga: MICROSUENO detectado en (4.65, -74.06)',
    };

    incidente.registrarRepeticion();
    expect(incidente.nombreEstado).toBe('Detectado');

    incidente.escalar([accion]);

    expect(incidente.nombreEstado).toBe('Escalado');
    expect(incidente.nivel()).toBe(NivelRiesgo.CRITICO);
    expect(incidente.historialAcciones).toEqual([accion]);
  });

  it('Un incidente atendido no registra nuevas acciones al escalar', () => {
    const incidente = new IncidenteBuilder()
      .paraConductor('c-01')
      .deTipo(TipoEvento.MICROSUENO)
      .ocurridoEn(new Date('2026-10-20T12:00:00Z'))
      .construir();

    const accionInicial: AccionEscalamiento = {
      canal: Canal.PUSH,
      destinatario: 'copiloto-01',
      mensaje: 'Alerta de fatiga: MICROSUENO detectado',
    };

    incidente.escalar([accionInicial]);
    expect(incidente.nombreEstado).toBe('Escalado');
    expect(incidente.nivel()).toBe(NivelRiesgo.CRITICO);

    incidente.atender();
    expect(incidente.nombreEstado).toBe('Atendido');
    expect(incidente.nivel()).toBe(NivelRiesgo.NORMAL);

    const nuevaAccion: AccionEscalamiento = {
      canal: Canal.SMS,
      destinatario: '+573009998877',
      mensaje: 'Intento de re-escalamiento posterior a atención',
    };

    incidente.escalar([nuevaAccion]);
    incidente.registrarRepeticion();
    incidente.atender();

    expect(incidente.nombreEstado).toBe('Atendido');
    expect(incidente.nivel()).toBe(NivelRiesgo.NORMAL);
    expect(incidente.historialAcciones).toHaveLength(1);
    expect(incidente.historialAcciones).toEqual([accionInicial]);
  });
});
