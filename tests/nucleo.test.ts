import { describe, it } from 'vitest';

// PARTE 1 (núcleo): ServicioEscalamiento, ReglasEscalamiento, FabricaPoliticas y políticas (Strategy).
// Usar dobles de prueba sencillos (objetos que implementan los puertos) en vez de los adaptadores reales.
describe('Parte 1 – núcleo', () => {
  it.todo('ReglasEscalamiento escala cuando la alarma no fue silenciada');
  it.todo('ReglasEscalamiento escala cuando se alcanza el umbral de repeticiones aunque se haya silenciado');
  it.todo('FabricaPoliticas devuelve la política correcta para cada TipoPerfil');
  it.todo('PoliticaParticularSolo genera un SMS por cada contacto de emergencia');
  it.todo('ServicioEscalamiento envía cada acción por el notificador de su canal y guarda el incidente');
  it.todo('ServicioEscalamiento no notifica cuando la alerta fue silenciada y no hay repeticiones');
});
