import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonInput, IonSelect,
  IonIcon, IonSegment, IonSegmentButton, IonLabel, IonTextarea,
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { Tarefa } from '../services/tarefas.service';

@Component({
  selector: 'app-formulario-modal',
  templateUrl: './formulario-modal.page.html',
  styleUrls: ['./formulario-modal.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonContent, 
    IonItem, 
    IonInput, 
    
    IonIcon, 
    IonSegment, 
    IonSegmentButton, 
    IonLabel,
    IonTextarea
  ]
})
export class FormularioModalPage implements OnInit {

  @Input() tarefa!: Tarefa;

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController); 
  
  formTarefa!: FormGroup;

  constructor() {
    addIcons({ calendarOutline });
  }

  ngOnInit() {
    this.formTarefa = this.fb.group({
      titulo: ['', [Validators.required]],
      materia: ['', [Validators.required]],
      urgencia: ['baixa', [Validators.required]],
      dataEntrega: ['', [Validators.required]],
      descricao: ['']
    });

    if (this.tarefa) {
      this.formTarefa.patchValue({
        titulo: this.tarefa.titulo,
        materia: this.tarefa.materia,
        urgencia: this.tarefa.urgencia,
        dataEntrega: this.tarefa.dataEntrega,
        descricao: this.tarefa.descricao || ''
      });
    } 
  }

  fechar() {
   
    this.modalCtrl.dismiss(null, 'cancel');
  }

  salvar() {
    if (this.formTarefa.valid) {
      this.modalCtrl.dismiss(this.formTarefa.value, 'confirm');
    }
  }
}