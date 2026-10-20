import { describe, it } from 'vitest';

// PARTE 4 (cierre): prueba de abierto/cerrado exigida por el enunciado.
describe('Abierto/cerrado', () => {
  // Idea: crear en la prueba una PoliticaTransportePublico (implementa PoliticaEscalamiento)
  // y una subclase de FabricaPoliticas que sobrescribe crearPara (override): devuelve la nueva
  // política para ese perfil y llama a super.crearPara(contexto) para los demás. Así una subclase
  // decide qué producto crear (Factory Method) y ServicioEscalamiento la usa SIN modificar src/.
  it.todo('Se agrega una nueva política (Strategy) sin modificar ServicioEscalamiento');
});
