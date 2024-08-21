import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProviderService } from '../services/provider.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonButton,
  IonButtons,
  IonModal,
  IonInput,
  IonDatetime,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { Mascota } from '../interfaces/mascota';
import { Cita } from '../interfaces/cita';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonButton,
    IonButtons,
    IonModal,
    IonInput,
    IonDatetime,
    IonSelect,
    IonSelectOption,
  ],
  providers: [ProviderService],
})
export class Tab1Page {
  public mascotas: Mascota[] = [];
  private selectedFile: File | null = null;

  constructor(
    private dataProvider: ProviderService,
    private photoService: PhotoService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataProvider.getResponse().subscribe(async (response) => {
      if (response != null) {
        this.mascotas = Object.values(response) as Mascota[];

        for (const mascota of this.mascotas) {
          try {
            if (mascota.foto) {
              mascota.foto = await this.photoService.getPhotoPath(mascota.foto);
            }
          } catch (error) {
            console.error(
              `No se pudo cargar la foto para la mascota ${mascota.nombre}:`,
              error
            );
            mascota.foto = 'assets/images/default.jpg';
          }

          if (mascota.citas && Array.isArray(mascota.citas)) {
            mascota.citas.sort((a: Cita, b: Cita) => {
              const dateA = new Date(a.fecha).getTime();
              const dateB = new Date(b.fecha).getTime();
              return dateA - dateB;
            });
          }
        }
      }
    });
  }

  navigateToDetails(cita: Cita) {
    this.router.navigate(['/tabs/tab2', { cita: JSON.stringify(cita) }]);
  }

  nuevaMascota = this.fb.group({
    nombre: [''],
    fechaNacimiento: [''],
    tipo: [''],
    raza: [''],
    foto: [''],
  });

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async guardarMascota() {
    if (this.selectedFile) {
      const savedImageFile = await this.photoService.savePicture(
        this.selectedFile
      );
      const nuevaMascotaData: Mascota = {
        nombre: this.nuevaMascota.get('nombre')!.value || '',
        fecha_nacimiento: this.nuevaMascota.get('fechaNacimiento')!.value || '',
        tipo: this.nuevaMascota.get('tipo')!.value || '',
        raza: this.nuevaMascota.get('raza')!.value || '',
        foto: savedImageFile.filepath, // Guardamos el filepath en Firebase
        citas: [],
      };

      this.dataProvider.postResponse(nuevaMascotaData).subscribe((response) => {
        this.loadData();
        this.nuevaMascota.reset();
        this.selectedFile = null;
      });
    }
  }
}
