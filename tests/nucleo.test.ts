import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Canal, NivelRiesgo, TipoEvento, TipoPerfil, type AccionEscalamiento, type AlertaFatiga, type ContextoConductor } from '../src/dominio/tipos';
import { ReglasEscalamiento } from '../src/dominio/ReglasEscalamiento';
import { FabricaPoliticas } from '../src/aplicacion/FabricaPoliticas';
import { PoliticaParticularSolo } from '../src/dominio/politicas/PoliticaParticularSolo';
import { PoliticaParticularConCopiloto } from '../src/dominio/politicas/PoliticaParticularConCopiloto';
import { PoliticaFlota } from '../src/dominio/politicas/PoliticaFlota';
import { ServicioEscalamiento } from '../src/aplicacion/ServicioEscalamiento';
import type { ConsultorPerfil } from '../src/aplicacion/puertos/salida/ConsultorPerfil';
import type { RepositorioIncidentes } from '../src/aplicacion/puertos/salida/RepositorioIncidentes';
import type { Notificador } from '../src/aplicacion/puertos/salida/Notificador';
import { IncidenteBuilder } from '../src/dominio/incidente/IncidenteBuilder';
import type { Incidente } from '../src/dominio/incidente/Incidente';

class ConsultorPerfilStub implements ConsultorPerfil {
  constructor(private readonly profiles: Map<string, ContextoConductor>) {}

  async obtenerContexto(conductorId: string): Promise<ContextoConductor> {
    const profile = this.profiles.get(conductorId);
    if (!profile) {
      throw new Error(`Profile not found for conductor: ${conductorId}`);
    }
    return profile;
  }
}

class RepositorioIncidentesSpy implements RepositorioIncidentes {
  readonly saved: Incidente[] = [];

  constructor(private readonly recentCount: number = 0) {}

  async guardar(incidente: Incidente): Promise<void> {
    this.saved.push(incidente);
  }

  async contarRecientes(conductorId: string, desde: Date): Promise<number> {
    return this.recentCount;
  }
}

class NotificadorSpy implements Notificador {
  readonly sentActions: AccionEscalamiento[] = [];

  async enviar(accion: AccionEscalamiento): Promise<void> {
    this.sentActions.push(accion);
  }
}

describe('Parte 1 – núcleo', () => {
  beforeEach(() => {
    try {
      new IncidenteBuilder()
        .paraConductor('c-check')
        .deTipo(TipoEvento.MICROSUENO)
        .ocurridoEn(new Date())
        .construir();
    } catch (error) {
      if (error instanceof Error && error.message.includes('TODO PARTE 2')) {
        let isSilenced = false;
        vi.spyOn(IncidenteBuilder.prototype, 'paraConductor').mockReturnThis();
        vi.spyOn(IncidenteBuilder.prototype, 'deTipo').mockReturnThis();
        vi.spyOn(IncidenteBuilder.prototype, 'ocurridoEn').mockReturnThis();
        vi.spyOn(IncidenteBuilder.prototype, 'enUbicacion').mockReturnThis();
        vi.spyOn(IncidenteBuilder.prototype, 'silenciado').mockImplementation(function (this: any, val: boolean) {
          isSilenced = val;
          return this;
        });
        vi.spyOn(IncidenteBuilder.prototype, 'construir').mockImplementation(() => ({
          conductorId: 'c-test',
          tipo: TipoEvento.MICROSUENO,
          ocurridoEn: new Date(),
          silenciado: isSilenced,
          registrarRepeticion: vi.fn(),
          escalar: vi.fn(),
          atender: vi.fn(),
          nivel: () => (isSilenced ? NivelRiesgo.NORMAL : NivelRiesgo.CRITICO),
        } as unknown as Incidente));
      }
    }
  });

  it('ReglasEscalamiento escala cuando la alarma no fue silenciada', () => {
    const rules = new ReglasEscalamiento(10, 3);
    const incident = { silenciado: false } as Incidente;
    expect(rules.debeEscalar(incident, 0)).toBe(true);
  });

  it('ReglasEscalamiento escala cuando se alcanza el umbral de repeticiones aunque se haya silenciado', () => {
    const rules = new ReglasEscalamiento(10, 3);
    const incident = { silenciado: true } as Incidente;
    expect(rules.debeEscalar(incident, 2)).toBe(true);
    expect(rules.debeEscalar(incident, 1)).toBe(false);
  });

  it('FabricaPoliticas devuelve la política correcta para cada TipoPerfil', () => {
    const factory = new FabricaPoliticas();

    const soloPolicy = factory.crearPara({
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+12345'],
    });
    expect(soloPolicy).toBeInstanceOf(PoliticaParticularSolo);

    const copilotPolicy = factory.crearPara({
      conductorId: 'c-copiloto',
      tipoPerfil: TipoPerfil.PARTICULAR_CON_COPILOTO,
      contactosEmergencia: [],
      copilotoId: 'token-copilot',
    });
    expect(copilotPolicy).toBeInstanceOf(PoliticaParticularConCopiloto);

    const fleetPolicy = factory.crearPara({
      conductorId: 'c-flota',
      tipoPerfil: TipoPerfil.FLOTA,
      contactosEmergencia: [],
      flotaId: 'fleet-1',
    });
    expect(fleetPolicy).toBeInstanceOf(PoliticaFlota);
  });

  it('PoliticaParticularSolo genera un SMS por cada contacto de emergencia', () => {
    const policy = new PoliticaParticularSolo();
    const incident = {
      tipo: TipoEvento.MICROSUENO,
      ubicacion: { latitud: 4.65, longitud: -74.06 },
    } as Incidente;
    const context: ContextoConductor = {
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233', '+573004445566'],
    };

    const actions = policy.decidirAcciones(incident, context);
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual({
      canal: Canal.SMS,
      destinatario: '+573001112233',
      mensaje: expect.stringContaining('MICROSUENO'),
    });
    expect(actions[1].destinatario).toBe('+573004445566');
  });

  it('ServicioEscalamiento envía cada acción por el notificador de su canal y guarda el incidente', async () => {
    const profile: ContextoConductor = {
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233'],
    };
    const profiles = new ConsultorPerfilStub(new Map([[profile.conductorId, profile]]));
    const repository = new RepositorioIncidentesSpy(0);
    const smsNotifier = new NotificadorSpy();
    const notifiers = new Map<Canal, Notificador>([[Canal.SMS, smsNotifier]]);

    const service = new ServicioEscalamiento(
      profiles,
      repository,
      new ReglasEscalamiento(10, 3),
      new FabricaPoliticas(),
      notifiers,
    );

    const alert: AlertaFatiga = {
      conductorId: 'c-solo',
      tipo: TipoEvento.MICROSUENO,
      silenciada: false,
      ocurridaEn: new Date(),
    };

    const result = await service.procesar(alert);

    expect(result.escalado).toBe(true);
    expect(smsNotifier.sentActions).toHaveLength(1);
    expect(smsNotifier.sentActions[0].destinatario).toBe('+573001112233');
    expect(repository.saved).toHaveLength(1);
  });

  it('ServicioEscalamiento no notifica cuando la alerta fue silenciada y no hay repeticiones', async () => {
    const profile: ContextoConductor = {
      conductorId: 'c-solo',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233'],
    };
    const profiles = new ConsultorPerfilStub(new Map([[profile.conductorId, profile]]));
    const repository = new RepositorioIncidentesSpy(0);
    const smsNotifier = new NotificadorSpy();
    const notifiers = new Map<Canal, Notificador>([[Canal.SMS, smsNotifier]]);

    const service = new ServicioEscalamiento(
      profiles,
      repository,
      new ReglasEscalamiento(10, 3),
      new FabricaPoliticas(),
      notifiers,
    );

    const alert: AlertaFatiga = {
      conductorId: 'c-solo',
      tipo: TipoEvento.MICROSUENO,
      silenciada: true,
      ocurridaEn: new Date(),
    };

    const result = await service.procesar(alert);

    expect(result.escalado).toBe(false);
    expect(smsNotifier.sentActions).toHaveLength(0);
    expect(result.acciones).toHaveLength(0);
    expect(repository.saved).toHaveLength(1);
  });
});

