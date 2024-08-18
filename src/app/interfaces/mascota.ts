import { Cita } from './cita';
export interface Mascota {
  nombre: string;
  fecha_nacimiento: string;
  tipo: string;
  raza: string;
  foto: string;
  citas: Cita[];
}
