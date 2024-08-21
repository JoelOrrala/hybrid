import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonImg, IonInput, IonDatetime, IonSelect } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { AnimationController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { addDays, format } from 'date-fns';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar, IonModal, IonImg, IonInput, IonDatetime, IonSelect, ReactiveFormsModule]
})
export class Tab4Page implements OnInit {
  appointments = [
    { id: 1, name: 'Fluffy', description: 'Annual check-up', selected: false },
    { id: 2, name: 'Sparky', description: 'Vaccination', selected: false },
    { id: 3, name: 'Whiskers', description: 'Dental cleaning', selected: false }
  ];

  formularioCitas: FormGroup;
  defaultDate: string;
  defaultTime: string;

  constructor(private animationCtrl: AnimationController, private fb: FormBuilder) {
    addIcons({ addOutline, trashOutline });

    const now = new Date();
    const tomorrow = addDays(now, 1);
    this.defaultDate = format(tomorrow, 'dd/MM/yyyy');
    this.defaultTime = format(now, 'HH:mm');

    this.formularioCitas= this.fb.group({
      motivo: ['', [Validators.required]],
      lugar: ['', [Validators.required]],
      veterinario: ['', [Validators.required]],
      fecha: [this.defaultDate],
      hora: [this.defaultTime],
    });

    this.formularioCitas.get('fecha')!.valueChanges.subscribe(value => {
      if (value !== this.defaultDate) {
        this.formularioCitas.get('fecha')!.markAsTouched();
      }
    });
  }

  setDateTime(dateTime: string) {
    const [date, time] = dateTime.split('T');
    const localTime = time.split('Z')[0];

    this.formularioCitas.patchValue({
      date: date,
      time: localTime,
    });
  }

  hasSelectedAppointments() {
    return this.appointments.some(app => app.selected);
  }

  deleteSelectedAppointments() {
    this.appointments = this.appointments.filter(app => app.selected);
  }

  ngOnInit() {
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

  /* Form submission*/
  onSubmit() {
    if (this.formularioCitas.controls['fecha'].valueChanges) {
      this.setDateTime(this.formularioCitas.get('fecha')!.value || '');
    }
    if (this.formularioCitas.valid) {
      console.log('Form Submitted!', this.formularioCitas.value);
    } else {
      console.log('Form is invalid');
    }
    this.formularioCitas.reset();
  }
}
