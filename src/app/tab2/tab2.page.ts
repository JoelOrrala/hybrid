import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonButton,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Cita } from '../interfaces/cita';
import { Mascota } from '../interfaces/mascota';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    ExploreContainerComponent,
    IonButton,
    CommonModule,
  ],
})
export class Tab2Page implements OnInit {
  cita: Cita | null = null;
  mascota: Mascota | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.cita = JSON.parse(params['cita']);
      this.mascota = JSON.parse(params['mascota']);
    });
  }
}
