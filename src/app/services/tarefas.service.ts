import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, of, map } from 'rxjs';

export interface Tarefa {
  id?: string;
  titulo: string;
  materia: string;
  urgencia: 'alta' | 'media' | 'baixa';
  dataEntrega: string;
  concluida: boolean;
  userId: string;
  dataCriacao: number;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  getTarefas(): Observable<Tarefa[]> {
    const usuario = this.authService.getUsuarioAtual();
    
    console.log("ID do Usuário Atual Logado:", usuario?.uid);
  
    const tarefasCollection = collection(this.firestore, 'tarefas');
    
  
    return collectionData(tarefasCollection, { idField: 'id' }).pipe(
      map((tarefas: any[]) => {
        if (tarefas.length > 0) {
          console.log("ID do userId salvo na primeira tarefa do banco:", tarefas[0].userId);
        }
        return tarefas.filter(t => t.userId === usuario?.uid);
      })
    ) as Observable<Tarefa[]>;
  }


adicionarTarefa(titulo: string, materia: string, urgencia: 'alta' | 'media' | 'baixa', dataEntrega: string, descricao: string) {
  const usuario = this.authService.getUsuarioAtual();
  if (!usuario) return Promise.reject('Usuário não autenticado');

  console.log('Usuário tentando adicionar tarefa:', usuario);

  const tarefasCollection = collection(this.firestore, 'tarefas');
  
  const novaTarefa: Tarefa = {
    titulo,
    materia,
    urgencia,
    dataEntrega,
    concluida: false,
    userId: usuario.uid,
    dataCriacao: Date.now(),
    descricao: descricao || ''
  };

  return addDoc(tarefasCollection, novaTarefa);
}


  atualizarStatus(id: string, concluida: boolean) {
    const tarefaDocRef = doc(this.firestore, `tarefas/${id}`);
    return updateDoc(tarefaDocRef, { concluida });
  }

  excluirTarefa(id: string) {
    const tarefaDocRef = doc(this.firestore, `tarefas/${id}`);
    return deleteDoc(tarefaDocRef);
  }

  atualizarTarefa(id: string, dadosAtualizados: Partial<Tarefa>) {
    const docRef = doc(this.firestore, 'tarefas', id);
    return updateDoc(docRef, dadosAtualizados);
  }
}