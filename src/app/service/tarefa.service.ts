import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { Tarefa } from '../interface/tarefa';

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  private readonly STORAGE_KEY = 'tarefas';
  private tarefasSubject = new BehaviorSubject<Tarefa[]>(this.loadFromStorage());
  tarefas$ = this.tarefasSubject.asObservable();

  constructor() {}

  // Carregar as tarefas do localStorage, ou retornar array vazio
  private loadFromStorage(): Tarefa[] {
    const tarefasJson = localStorage.getItem(this.STORAGE_KEY);
    return tarefasJson ? JSON.parse(tarefasJson) : [];
  }

  // Salvar as tarefas no localStorage
  private saveToStorage(tarefas: Tarefa[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tarefas));
  }

  listar(): void {
    // Como as tarefas já estão carregadas no BehaviorSubject,
    // apenas emitimos os dados atuais.
    // Se quiser, pode recarregar do storage:
    const tarefas = this.loadFromStorage();
    this.tarefasSubject.next(tarefas);
  }

  criar(tarefa: Tarefa): void {
    const tarefas = this.tarefasSubject.getValue();
    // Para simular um ID incremental:
    tarefa.id = tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 1;
    tarefas.unshift(tarefa);
    this.saveToStorage(tarefas);
    this.tarefasSubject.next(tarefas);
  }

  editar(tarefa: Tarefa, atualizarSubject: boolean): void {
    const tarefas = this.tarefasSubject.getValue();
    const index = tarefas.findIndex(t => t.id === tarefa.id);
    if (index !== -1) {
      tarefas[index] = tarefa;
      this.saveToStorage(tarefas);
      if (atualizarSubject) {
        this.tarefasSubject.next(tarefas);
      }
    }
  }

  excluir(id: number): void {
    let tarefas = this.tarefasSubject.getValue();
    tarefas = tarefas.filter(t => t.id !== id);
    this.saveToStorage(tarefas);
    this.tarefasSubject.next(tarefas);
  }

  buscarPorId(id: number): Observable<Tarefa | undefined> {
    const tarefas = this.tarefasSubject.getValue();
    const tarefa = tarefas.find(t => t.id === id);
    return of(tarefa);
  }

  atualizarStatusTarefa(tarefa: Tarefa): void {
    tarefa.statusFinalizado = !tarefa.statusFinalizado;
    this.editar(tarefa, true);
  }
}
