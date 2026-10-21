import { describe, expect, it } from 'vitest';
import { TipoEvento, TipoPerfil, type ContextoConductor } from '../src/dominio/tipos';
import { IncidenteBuilder } from '../src/dominio/incidente/IncidenteBuilder';
import { RepositorioIncidentesEnMemoria } from '../src/adaptadores/salida/RepositorioIncidentesEnMemoria';
import { ConsultorPerfilSimulado } from '../src/adaptadores/salida/ConsultorPerfilSimulado';

// PARTE 3 (adaptadores): Adapter (FCM, SMS), Decorator (reintento), repositorio y perfiles simulados.
function incidente(conductorId: string, ocurridoEn: string) {
  return new IncidenteBuilder()
    .paraConductor(conductorId)
    .deTipo(TipoEvento.MICROSUENO)
    .ocurridoEn(new Date(ocurridoEn))
    .construir();
}

describe('Parte 3 – adaptadores', () => {
  it.todo('NotificadorSmsSimulado traduce la acción a sendMessage(numero, texto)');
  it.todo('NotificadorConReintento reintenta hasta lograr el envío cuando el proveedor falla temporalmente');
  it.todo('NotificadorConReintento relanza el error si fallan todos los intentos');

  it('RepositorioIncidentesEnMemoria cuenta solo los incidentes del conductor dentro de la ventana', async () => {
    const repositorio = new RepositorioIncidentesEnMemoria();
    await repositorio.guardar(incidente('c1', '2026-10-20T09:00:00Z')); // fuera de la ventana
    await repositorio.guardar(incidente('c1', '2026-10-20T10:00:00Z')); // justo en el límite: cuenta
    await repositorio.guardar(incidente('c1', '2026-10-20T10:05:00Z'));
    await repositorio.guardar(incidente('c2', '2026-10-20T10:05:00Z')); // otro conductor

    const desde = new Date('2026-10-20T10:00:00Z');

    expect(await repositorio.contarRecientes('c1', desde)).toBe(2);
    expect(await repositorio.contarRecientes('sin-incidentes', desde)).toBe(0);
    expect(repositorio.todos()).toHaveLength(4);
  });

  it('ConsultorPerfilSimulado devuelve el perfil registrado y lanza un error si no existe', async () => {
    const perfil: ContextoConductor = {
      conductorId: 'c1',
      tipoPerfil: TipoPerfil.PARTICULAR_SOLO,
      contactosEmergencia: ['+573001112233'],
    };
    const consultor = new ConsultorPerfilSimulado(new Map([['c1', perfil]]));

    expect(await consultor.obtenerContexto('c1')).toBe(perfil);
    await expect(consultor.obtenerContexto('desconocido')).rejects.toThrow(/desconocido/);
  });
});
