import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { UserPhoto } from '../interfaces/user-photo';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  // Función para guardar la foto localmente
  public async savePicture(file: File): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(file);
    const fileName = `${new Date().getTime()}.jpeg`;

    // Guardamos el archivo en el sistema de archivos
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // Devolvemos la información del archivo guardado
    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri, // Ruta completa en un entorno híbrido
        webviewPath: Capacitor.convertFileSrc(savedFile.uri), // Path que se puede usar en la vista
      };
    } else {
      return {
        filepath: fileName, // Nombre de archivo para usarlo en la web
        webviewPath: URL.createObjectURL(file),
      };
    }
  }

  // Función para convertir un archivo a base64
  private async readAsBase64(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Función para obtener la ruta de una imagen guardada
  public async getPhotoPath(filepath: string): Promise<string> {
    if (this.platform.is('hybrid')) {
      const convertedPath = Capacitor.convertFileSrc(filepath);
      return convertedPath;
    } else {
      const readFile = await Filesystem.readFile({
        path: filepath,
        directory: Directory.Data,
      });
      const base64Path = `data:image/jpeg;base64,${readFile.data}`;
      return base64Path;
    }
  }
}
