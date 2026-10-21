import { describe, expect, it, vi } from 'vitest';
import { ControladorAlertasRest } from '../src/adaptadores/entrada/ControladorAlertasRest';
import type { ProcesarAlerta, ResultadoProceso } from '../src/aplicacion/puertos/entrada/ProcesarAlerta';
import { Canal, NivelRiesgo, TipoEvento, type AlertaFatiga } from '../src/dominio/tipos';


describe('ControladorAlertasRest', () => {
  it('rechaza un JSON sin conductorId', async () => {
    const casoDeUsoFalso: ProcesarAlerta = {
      procesar: vi.fn(),
    };
    const controlador = new ControladorAlertasRest(casoDeUsoFalso);

    const payloadInvalido = {
      tipo: 'MICROSUENO',
      silenciada: false,
      ocurridaEn: new Date().toISOString(),
    };

    await expect(controlador.recibirAlerta(payloadInvalido)).rejects.toThrow(/conductorId/i);
    expect(casoDeUsoFalso.procesar).not.toHaveBeenCalled();
  });

  it('convierte el JSON en AlertaFatiga y la entrega al caso de uso', async () => {
    let alertaRecibida: AlertaFatiga | null = null;
    const respuestaMock: ResultadoProceso = {
      escalado: true,
      nivel: NivelRiesgo.CRITICO,
      acciones: [
        {
          canal: Canal.SMS,
          destinatario: '+573001112233',
          mensaje: 'Alerta crítica',
        },
      ],
    };

    const casoDeUsoFalso: ProcesarAlerta = {
      procesar: vi.fn(async (alerta: AlertaFatiga) => {
        alertaRecibida = alerta;
        return respuestaMock;
      }),
    };

    const controlador = new ControladorAlertasRest(casoDeUsoFalso);
    const fechaIso = '2026-10-20T10:30:00.000Z';
    const payload = {
      conductorId: 'cond-123',
      tipo: 'MICROSUENO',
      silenciada: false,
      ocurridaEn: fechaIso,
      ubicacion: {
        latitud: 4.60971,
        longitud: -74.08175,
      },
    };

    const resultado = await controlador.recibirAlerta(payload);

    expect(casoDeUsoFalso.procesar).toHaveBeenCalledTimes(1);
    expect(alertaRecibida).not.toBeNull();
    const alerta = alertaRecibida as unknown as AlertaFatiga;
    expect(alerta.conductorId).toBe('cond-123');
    expect(alerta.tipo).toBe(TipoEvento.MICROSUENO);
    expect(alerta.silenciada).toBe(false);
    expect(alerta.ocurridaEn).toBeInstanceOf(Date);
    expect(alerta.ocurridaEn.toISOString()).toBe(fechaIso);
    expect(alerta.ubicacion).toEqual({
      latitud: 4.60971,
      longitud: -74.08175,
    });
    expect(resultado).toEqual(respuestaMock);
  });
});

