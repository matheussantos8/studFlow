import { Component, OnInit, OnDestroy, inject, NgZone, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, 
  IonSegmentButton, IonLabel, IonList, IonItemSliding, 
  IonItemOptions, IonItemOption, IonItem, IonIcon, 
  IonNote, IonFab, IonFabButton, ModalController, AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common'; 
import { checkmarkCircleOutline, trashOutline, calendarOutline, sparklesOutline, add, createOutline, chevronBackOutline } from 'ionicons/icons';

import { FormularioModalPage } from '../formulario-modal/formulario-modal.page';
import { TarefasService, Tarefa } from '../services/tarefas.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonSegment, IonSegmentButton, IonLabel, IonList, IonItemSliding, 
    IonItemOptions, IonItemOption, IonItem, IonIcon, IonNote, 
    IonFab, IonFabButton
  ]
})
export class HomePage implements OnInit, OnDestroy {

  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);
  private tarefasService = inject(TarefasService);
  private zone = inject(NgZone);

  listaTarefas: Tarefa[] = [];
  filtroAtual: 'pendentes' | 'concluidas' = 'pendentes';
  animacaoExecutada = false; 
  
  private tarefasSubscription!: Subscription;

  @ViewChildren(IonItemSliding) slidingItems!: QueryList<any>;

  constructor() {
    addIcons({ sparklesOutline, calendarOutline, checkmarkCircleOutline, createOutline, trashOutline, add, chevronBackOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.tarefasSubscription) {
      this.tarefasSubscription.unsubscribe();
    }

    this.tarefasSubscription = this.tarefasService.getTarefas().subscribe({
      next: (dados) => {
        this.zone.run(() => {
          this.listaTarefas = dados;
          console.log('Tarefas carregadas com sucesso:', this.listaTarefas);
          
          if (!this.animacaoExecutada && dados.length > 0) {
            this.animacaoExecutada = true; 
  
            setTimeout(() => {
              const primeiroItem = this.slidingItems?.first; 
              if (primeiroItem) {
                primeiroItem.open('end'); 
                
                setTimeout(() => primeiroItem.close(), 800);
              }
            }, 1000); 
          }
        });
      },
      error: (erro) => console.error('Erro ao buscar tarefas:', erro)
    });
  }

  ionViewWillLeave() {
    if (this.tarefasSubscription) {
      this.tarefasSubscription.unsubscribe(); 
    }
  }

  ngOnDestroy() {
    if (this.tarefasSubscription) {
      this.tarefasSubscription.unsubscribe();
    }
  }

  async mostrarDetalhes(tarefa: Tarefa, slidingItem: any) {
    const statusTexto = tarefa.concluida ? 'Concluída ✅' : 'Pendente ⏳';
    const urgenciaTexto = tarefa.urgencia.toUpperCase();
  
    const botoesAlert: any[] = [
      {
        text: 'Fechar',
        role: 'cancel'
      }
    ];
  
    if (!tarefa.concluida) {
      botoesAlert.push({
        text: 'Concluir Tarefa',
        handler: () => {
          this.concluirTarefa(tarefa.id, slidingItem);
        }
      });
    }
  
    const alert = await this.alertCtrl.create({
      header: tarefa.titulo,
      subHeader: `Matéria: ${tarefa.materia}`,
      message: `Urgência: ${urgenciaTexto}\nData de Entrega: ${tarefa.dataEntrega}\nStatus: ${statusTexto} \nDescrição: ${tarefa.descricao || 'Nenhuma descrição informada.'}`,
      cssClass: 'alert-detalhes-tarefa',
      buttons: botoesAlert 
    });
  
    await alert.present();
  }

  async editarTarefa(tarefa: Tarefa, slidingItem: any) {
    if (slidingItem) slidingItem.close();
  
    const modal = await this.modalCtrl.create({
      component: FormularioModalPage,
      componentProps: { tarefa: tarefa } 
    });
  
    await modal.present();
  
    const { data, role } = await modal.onWillDismiss();
  
    if (role === 'confirm' && data) {
      this.zone.run(() => {
        this.tarefasService.atualizarTarefa(tarefa.id!, data)
          .then(() => console.log('Tarefa updated!'))
          .catch(erro => console.error('Erro ao atualizar:', erro));
      });
    }
  }

  get tarefasPendentes() { 
    return this.listaTarefas.filter(t => !t.concluida); 
  }
  
  get tarefasFiltradas() { 
    return this.filtroAtual === 'pendentes' 
      ? this.tarefasPendentes 
      : this.listaTarefas.filter(t => t.concluida); 
  }

  mudarFiltro(event: any) { 
    this.filtroAtual = event.detail.value; 
  }

  concluirTarefa(id?: string, slidingItem?: any) { 
    if (!id) return; 
    
    this.zone.run(() => {
      this.tarefasService.atualizarStatus(id, true)
        .then(() => {
          console.log('Tarefa concluída no Firestore!');
          if (slidingItem) slidingItem.close(); 
        })
        .catch(erro => console.error('Erro ao concluir tarefa:', erro));
    });
  }

  async excluirTarefa(id?: string) {
    if (!id) return;
  
    const alert = await this.alertCtrl.create({
      header: 'Excluir Tarefa',
      message: 'Tem certeza que deseja apagar esta tarefa para sempre?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.zone.run(() => {
              this.tarefasService.excluirTarefa(id)
                .then(() => console.log('Tarefa deletada!'))
                .catch(erro => console.error('Erro ao deletar:', erro));
            });
          }
        }
      ]
    });
  
    await alert.present();
  }

  async abrirModalAdicionar() {
    const modal = await this.modalCtrl.create({
      component: FormularioModalPage,
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75, 0.9],
      handle: true
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.zone.run(() => {
        this.tarefasService.adicionarTarefa(data.titulo, data.materia, data.urgencia, data.dataEntrega, data.descricao)
          .catch(erro => console.error('Erro ao adicionar tarefa:', erro));
      });
    }
  }
}