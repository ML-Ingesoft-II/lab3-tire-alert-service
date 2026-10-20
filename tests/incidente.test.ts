import { describe, it } from 'vitest';

// PARTE 2 (incidente): State (estados del incidente) y Builder.
describe('Parte 2 – incidente', () => {
  it.todo('IncidenteBuilder construye un incidente en estado Detectado con nivel PRECAUCION');
  it.todo('IncidenteBuilder lanza un error si falta el conductor, el tipo o la fecha');
  it.todo('Un incidente detectado pasa a Escalado (nivel CRITICO) al escalar');
  it.todo('Un incidente atendido no registra nuevas acciones al escalar');
});
