// Tipos básicos del dominio. Compartidos por todas las partes: no cambiar sin avisar al grupo.

export enum NivelRiesgo {
  NORMAL = 'NORMAL',
  PRECAUCION = 'PRECAUCION',
  CRITICO = 'CRITICO',
}

export enum TipoPerfil {
  PARTICULAR_SOLO = 'PARTICULAR_SOLO',
  PARTICULAR_CON_COPILOTO = 'PARTICULAR_CON_COPILOTO',
  FLOTA = 'FLOTA',
}

export enum Canal {
  PUSH = 'PUSH',
  SMS = 'SMS',
  DASHBOARD = 'DASHBOARD',
}

export enum TipoEvento {
  MICROSUENO = 'MICROSUENO',
  CABECEO = 'CABECEO',
}

export interface Ubicacion {
  latitud: number;
  longitud: number;
}

/** Alerta que llega desde la app móvil (a través de tire_api_gateway). */
export interface AlertaFatiga {
  conductorId: string;
  tipo: TipoEvento;
  silenciada: boolean;
  ocurridaEn: Date;
  ubicacion?: Ubicacion;
}

/** Perfil del conductor, obtenido de tire_user_service o tire_fleet_service. */
export interface ContextoConductor {
  conductorId: string;
  tipoPerfil: TipoPerfil;
  contactosEmergencia: string[]; // números de teléfono
  copilotoId?: string; // token del dispositivo del copiloto
  flotaId?: string;
}

/** Un aviso concreto: por qué canal, a quién y con qué mensaje. */
export interface AccionEscalamiento {
  canal: Canal;
  destinatario: string;
  mensaje: string;
}
