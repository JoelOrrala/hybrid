import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  IonGrid,
  IonCol,
  IonRow,
  IonThumbnail,
  IonRadioGroup,
  IonRadio,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, navigateOutline } from 'ionicons/icons';
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
import { dogImg } from '../interfaces/dog-img';
import { MascotaConClave } from '../interfaces/mascota-con-clave';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { Tab1Page } from '../tab1/tab1.page';

register();

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
    IonGrid,
    IonCol,
    IonRow,
    IonThumbnail,
    IonRadioGroup,
    IonRadio,
  ],
  providers: [ProviderService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  dogs:dogImg[] = []
  dogImgs:string[] = []
  dogNames:string[] = []
  soonDog:dogImg = {url: '', nombre: '',}

  formularioCitas: FormGroup;
  eliminarCita: FormGroup;
  defaultDate: string;
  defaultTime: string;
  defaultMascota: string = 'Mascota';
  public mascotas: MascotaConClave[] = [];
  private mascotaKeys: { [nombre: string]: string } = {};

  loading:boolean = true;
  mascotaSeleccionada:MascotaConClave = {key: '', nombre: '', fecha_nacimiento: '', raza: '', foto: '', citas: [], tipo: ''};

  constructor(
    private animationCtrl: AnimationController,
    private fb: FormBuilder,
    private dataProvider: ProviderService,
    private photoService: PhotoService,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({ addOutline, trashOutline, navigateOutline });

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

    this.eliminarCita = this.fb.group({
      mascota: [this.defaultMascota],
      cita: [''],
    });

    this.formularioCitas.get('fecha')!.valueChanges.subscribe((value) => {
      if (value !== this.defaultDate) {
        this.formularioCitas.get('fecha')!.markAsTouched();
      }
    });
  }

  ngOnInit() {
    this.fetchDogData();
    this.loadMascotas();
  }

  actualizarMascotas() {
    this.loading = true; // Mostrar un indicador de carga si lo deseas
    this.loadMascotas();
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
      this.loading = false;
    });
  }

  navigateToCitas() {
    this.router.navigate([ '/tabs/tab1' ]);
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

  /* Alertas */
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

  async invalidAppAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Cita no seleccionada',
      buttons: ['OK'],
    });

    await alert.present();
  }

  async deletedAppAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Cita Eliminada',
      buttons: ['OK'],
    });

    await alert.present();
  }

  // Function to fetch JSON data from the The Dog API
  async fetchDogData() {
    try {

      // URL of the API endpoint
      const apiUrl = 'https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&order=RANDOM&page=0&limit=10';
      const response = await fetch(apiUrl); // Make the fetch request

      const dogUrl = 'https://dogapi.dog/api/v2/breeds'
      const ndResponse = await fetch(dogUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Check if the response status is OK (status code 200-299)
      }
      if (!ndResponse.ok) {
        throw new Error(`HTTP error! status: ${ndResponse.status}`);
      }
      
      
      const presentation1:any = await fetch('https://api.thedogapi.com/v1/images/VyBXzOjjR');
      this.setDog(await presentation1.json());
      const presentation2:any = await fetch('https://api.thedogapi.com/v1/images/38KoA9gGB');
      this.setDog(await presentation2.json());
      const presentation3:any = await fetch('https://api.thedogapi.com/v1/images/PJvRHYfs1');
      this.setDog(await presentation3.json());

      var randomAnswer = Math.floor(Math.random() * 2);
      this.soonDog = this.dogs[randomAnswer];

      // Parse the JSON data
      const data:any[] = await response.json();
      const ndData = await ndResponse.json();
      const ndDataArray:any[] = ndData.data;

      console.log(response);

      // Se añade imagen al arreglo
      data.forEach((item) => {
        this.dogImgs.push(item.url);
      });

      ndDataArray.forEach((item) => {
        this.dogNames.push(item.attributes.name);
      });
    } catch (error) {
      // Manejo de errores
      console.error('Error fetching data:', error);
    }
  }

  setDog(response:any) {
    const dogImg:dogImg = {
      url:response.url,
      nombre:response.breeds[0].name,
    };
    this.dogs.push(dogImg);
  }

  /* Eliminar Cita */

  onPetChange(event: any) {
    const selectedPet:Mascota = event.detail.value;
    this.mascotaSeleccionada = this.getPet(selectedPet.nombre);
  }

  getPet(nombreMascota: string): MascotaConClave {

    const mascota = this.mascotas.find(
      (mascota) => mascota.nombre === nombreMascota
    ) as MascotaConClave | undefined;

    if (mascota === undefined) {
      this.invalidPetAlert();
      throw("Mascota no encontrada");
    } else {
      return mascota;
    }
  }

  deleteAppointment() {
    const citaEliminada = this.eliminarCita.controls['cita'].value;
    if (citaEliminada === '') {
      this.invalidAppAlert();
    } else {
      this.mascotaSeleccionada.citas = this.mascotaSeleccionada.citas.filter(cita => cita !== citaEliminada);
      if (this.mascotaSeleccionada.key) {
        this.dataProvider
          .putResponse(this.mascotaSeleccionada.key, this.mascotaSeleccionada)
          .subscribe((response) => {
            this.loadMascotas();
            this.deletedAppAlert();
            this.eliminarCita.reset();
            this.setDefaultsDel();
          });
      } else {
        console.log('No se encontró la clave de la mascota en Firebase');
      }
    }
  }

  setDefaultsDel() {
    this.eliminarCita.patchValue({
      mascota: this.defaultMascota,
      cita: '',
    });
    this.mascotaSeleccionada = {key: '', nombre: '', fecha_nacimiento: '', raza: '', foto: '', citas: [], tipo: ''};
  }
}
