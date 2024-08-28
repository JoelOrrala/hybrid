import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonImg,
  IonInput,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonCard,
  IonAlert,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { AnimationController, AlertController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/standalone';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { addDays, format } from 'date-fns';
import { HttpClientModule } from '@angular/common/http';
import { ProviderService } from '../services/provider.service';
import { PhotoService } from '../services/photo.service';
import { Mascota } from '../interfaces/mascota';
import { Cita } from '../interfaces/cita';
import { MascotaConClave } from '../interfaces/mascota-con-clave';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonModal,
    IonImg,
    IonInput,
    IonDatetime,
    IonSelect,
    ReactiveFormsModule,
    IonSelectOption,
    IonNote,
    IonCard,
    IonAlert,
  ],
  providers: [ProviderService],
})
export class Tab4Page implements OnInit {
  appointments = [
    { id: 1, name: 'Fluffy', description: 'Annual check-up', selected: false },
    { id: 2, name: 'Sparky', description: 'Vaccination', selected: false },
    {
      id: 3,
      name: 'Whiskers',
      description: 'Dental cleaning',
      selected: false,
    },
  ];

  formularioCitas: FormGroup;
  defaultDate: string;
  defaultTime: string;
  defaultMascota: string = 'Mascota';
  public mascotas: Mascota[] = [];
  private mascotaKeys: { [nombre: string]: string } = {};

  constructor(
    private animationCtrl: AnimationController,
    private fb: FormBuilder,
    private dataProvider: ProviderService,
    private photoService: PhotoService,
    private alertController: AlertController
  ) {
    this.loadMascotas();
    addIcons({ addOutline, trashOutline });

    const now = new Date();
    const tomorrow = addDays(now, 1);
    this.defaultDate = now.toISOString();
    this.defaultTime = tomorrow.toISOString();

    this.formularioCitas = this.fb.group({
      motivo: ['', [Validators.required]],
      lugar: ['', [Validators.required]],
      veterinario: ['', [Validators.required]],
      fecha: [this.defaultDate],
      hora: [this.defaultTime],
      mascota: [this.defaultMascota],
    });

    this.formularioCitas.get('fecha')!.valueChanges.subscribe((value) => {
      if (value !== this.defaultDate) {
        this.formularioCitas.get('fecha')!.markAsTouched();
      }
    });
  }

  loadMascotas() {
    this.dataProvider.getResponse().subscribe(async (response) => {
      if (response != null) {
        // Mapea la respuesta para obtener un array de mascotas con sus claves
        this.mascotas = Object.entries(response).map(([key, value]) => ({
          ...(value as Mascota),
          key,
        })) as MascotaConClave[];
      }
    });
  }

  setDefaults() {
    const now = new Date();
    const tomorrow = addDays(now, 1);
    this.defaultDate = now.toISOString();
    this.defaultTime = tomorrow.toISOString();

    this.formularioCitas.patchValue({
      fecha: this.defaultDate,
      hora: this.defaultTime,
      mascota: this.defaultMascota,
    });
  }

  setDateTime(dateTime: string) {
    const [date, time] = dateTime.split('T');
    const localTime = time.split('Z')[0];

    this.formularioCitas.patchValue({
      fecha: date,
      hora: localTime,
    });
  }

  hasSelectedAppointments() {
    return this.appointments.some((app) => app.selected);
  }

  deleteSelectedAppointments() {
    this.appointments = this.appointments.filter((app) => app.selected);
  }

  ngOnInit() {}

  /* Animated Modal */
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  /* Form submission */
  onSubmit() {
    if (this.formularioCitas.controls['fecha'].valueChanges) {
      this.setDateTime(this.formularioCitas.controls['fecha']!.value);
    }

    if (this.formularioCitas.valid) {
      const nombreMascota =
        this.formularioCitas.controls['mascota']!.value.nombre || '';
      const mascotaActualizada = this.mascotas.find(
        (mascota) => mascota.nombre === nombreMascota
      ) as MascotaConClave | undefined;

      if (mascotaActualizada === undefined) {
        this.invalidPetAlert();
      } else {
        const nuevaCita: Cita = {
          fecha: this.formularioCitas.get('fecha')!.value || '',
          hora: this.formularioCitas.get('hora')!.value || '',
          lugar: this.formularioCitas.get('lugar')!.value || '',
          motivo: this.formularioCitas.get('motivo')!.value || '',
          veterinario: this.formularioCitas.get('veterinario')!.value || '',
        };

        // Verificar si citas es un array, si no, inicializarlo
        if (!Array.isArray(mascotaActualizada.citas)) {
          mascotaActualizada.citas = [];
        }

        mascotaActualizada.citas.push(nuevaCita);

        if (mascotaActualizada.key) {
          this.dataProvider
            .putResponse(mascotaActualizada.key, mascotaActualizada)
            .subscribe((response) => {
              this.loadMascotas();
              this.presentAlert();
              this.formularioCitas.reset();
              this.setDefaults();
            });
        } else {
          console.log('No se encontró la clave de la mascota en Firebase');
        }
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  /* Alerta */
  async presentAlert() {
    const nombreMascota =
      this.formularioCitas.controls['mascota']!.value.nombre;
    const nombre =
      nombreMascota === undefined ? this.defaultMascota : nombreMascota;

    const alert = await this.alertController.create({
      header: 'Cita agendada con éxito',
      message: 'Cita para ' + nombre,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async invalidPetAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Mascota no seleccionada',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
