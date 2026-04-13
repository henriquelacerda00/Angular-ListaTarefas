import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Tarefa } from '../interface/tarefa';
import { AcaoHistorico } from '../interface/acao-historico';

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  private readonly STORAGE_KEY = 'tarefas';
  private readonly STORAGE_KEY_UNDO = 'pilhaUndo';
  private readonly STORAGE_KEY_REDO = 'pilhaRedo';

  private tarefasSubject = new BehaviorSubject<Tarefa[]>(this.loadFromStorage());
  tarefas$ = this.tarefasSubject.asObservable();

  private pilhaUndo: AcaoHistorico[] = this.loadUndoFromStorage();
  private pilhaRedo: AcaoHistorico[] = this.loadRedoFromStorage();

  constructor() {}

  private loadFromStorage(): Tarefa[] {
    const tarefasJson = localStorage.getItem(this.STORAGE_KEY);
    return tarefasJson ? JSON.parse(tarefasJson) : [];
  }

  private loadUndoFromStorage(): AcaoHistorico[] {
    const undoJson = localStorage.getItem(this.STORAGE_KEY_UNDO);
    return undoJson ? JSON.parse(undoJson) : [];
  }

  private loadRedoFromStorage(): AcaoHistorico[] {
    const redoJson = localStorage.getItem(this.STORAGE_KEY_REDO);
    return redoJson ? JSON.parse(redoJson) : [];
  }

  private saveToStorage(tarefas: Tarefa[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tarefas));
  }

  private saveUndoToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY_UNDO, JSON.stringify(this.pilhaUndo));
  }

  private saveRedoToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY_REDO, JSON.stringify(this.pilhaRedo));
  }

  private atualizarEstado(tarefas: Tarefa[]): void {
    this.saveToStorage(tarefas);
    this.saveUndoToStorage();
    this.saveRedoToStorage();
    this.tarefasSubject.next([...tarefas]);
  }

  private clonarTarefa(tarefa: Tarefa): Tarefa {
    return JSON.parse(JSON.stringify(tarefa));
  }

  private limparRedo(): void {
    this.pilhaRedo = [];
    this.saveRedoToStorage();
  }

  listar(): void {
    const tarefas = this.loadFromStorage();
    this.pilhaUndo = this.loadUndoFromStorage();
    this.pilhaRedo = this.loadRedoFromStorage();
    this.tarefasSubject.next(tarefas);
  }

  criar(tarefa: Tarefa): void {
    const tarefas = [...this.tarefasSubject.getValue()];

    const novaTarefa: Tarefa = {
      ...tarefa,
      id: tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 1,
    };

    tarefas.unshift(novaTarefa);

    this.pilhaUndo.push({
      tipo: 'criar',
      tarefa: this.clonarTarefa(novaTarefa),
      indice: 0,
    });

    this.limparRedo();
    this.atualizarEstado(tarefas);
  }

  editar(tarefa: Tarefa, atualizarSubject: boolean = true): void {
    const tarefas = [...this.tarefasSubject.getValue()];
    const index = tarefas.findIndex(t => t.id === tarefa.id);

    if (index !== -1) {
      const tarefaAnterior = this.clonarTarefa(tarefas[index]);
      const tarefaNova = this.clonarTarefa(tarefa);

      tarefas[index] = tarefaNova;

      this.pilhaUndo.push({
        tipo: 'editar',
        tarefaAnterior,
        tarefaNova,
      });

      this.limparRedo();

      if (atualizarSubject) {
        this.atualizarEstado(tarefas);
      } else {
        this.saveToStorage(tarefas);
        this.saveUndoToStorage();
        this.saveRedoToStorage();
      }
    }
  }

  excluir(id: number): void {
    const tarefas = [...this.tarefasSubject.getValue()];
    const index = tarefas.findIndex(t => t.id === id);

    if (index === -1) return;

    const tarefaRemovida = this.clonarTarefa(tarefas[index]);
    tarefas.splice(index, 1);

    this.pilhaUndo.push({
      tipo: 'excluir',
      tarefa: tarefaRemovida,
      indice: index,
    });

    this.limparRedo();
    this.atualizarEstado(tarefas);
  }

  buscarPorId(id: number): Observable<Tarefa | undefined> {
    const tarefas = this.tarefasSubject.getValue();
    const tarefa = tarefas.find(t => t.id === id);
    return of(tarefa);
  }

  atualizarStatusTarefa(tarefa: Tarefa): void {
    const tarefas = [...this.tarefasSubject.getValue()];
    const index = tarefas.findIndex(t => t.id === tarefa.id);

    if (index === -1) return;

    const tarefaAnterior = this.clonarTarefa(tarefas[index]);
    const tarefaAtualizada: Tarefa = {
      ...tarefas[index],
      statusFinalizado: !tarefas[index].statusFinalizado,
    };

    tarefas[index] = tarefaAtualizada;

    this.pilhaUndo.push({
      tipo: 'status',
      tarefaAnterior,
      tarefaNova: this.clonarTarefa(tarefaAtualizada),
    });

    this.limparRedo();
    this.atualizarEstado(tarefas);
  }

  desfazer(): void {
    if (this.pilhaUndo.length === 0) return;

    const tarefas = [...this.tarefasSubject.getValue()];
    const ultimaAcao = this.pilhaUndo.pop();

    if (!ultimaAcao) return;

    switch (ultimaAcao.tipo) {
      case 'criar': {
        const index = tarefas.findIndex(t => t.id === ultimaAcao.tarefa?.id);
        if (index !== -1) {
          tarefas.splice(index, 1);
        }
        break;
      }

      case 'editar': {
        const index = tarefas.findIndex(t => t.id === ultimaAcao.tarefaAnterior?.id);
        if (index !== -1 && ultimaAcao.tarefaAnterior) {
          tarefas[index] = this.clonarTarefa(ultimaAcao.tarefaAnterior);
        }
        break;
      }

      case 'excluir': {
        if (ultimaAcao.tarefa && ultimaAcao.indice !== undefined) {
          tarefas.splice(ultimaAcao.indice, 0, this.clonarTarefa(ultimaAcao.tarefa));
        }
        break;
      }

      case 'status': {
        const index = tarefas.findIndex(t => t.id === ultimaAcao.tarefaAnterior?.id);
        if (index !== -1 && ultimaAcao.tarefaAnterior) {
          tarefas[index] = this.clonarTarefa(ultimaAcao.tarefaAnterior);
        }
        break;
      }
    }

    this.pilhaRedo.push(ultimaAcao);
    this.atualizarEstado(tarefas);
  }

  refazer(): void {
    if (this.pilhaRedo.length === 0) return;

    const tarefas = [...this.tarefasSubject.getValue()];
    const ultimaAcao = this.pilhaRedo.pop();

    if (!ultimaAcao) return;

    switch (ultimaAcao.tipo) {
      case 'criar': {
        if (ultimaAcao.tarefa) {
          tarefas.splice(ultimaAcao.indice ?? 0, 0, this.clonarTarefa(ultimaAcao.tarefa));
        }
        break;
      }

      case 'editar': {
        const index = tarefas.findIndex(t => t.id === ultimaAcao.tarefaNova?.id);
        if (index !== -1 && ultimaAcao.tarefaNova) {
          tarefas[index] = this.clonarTarefa(ultimaAcao.tarefaNova);
        }
        break;
      }

      case 'excluir': {
        const index = tarefas.findIndex(t => t.id === ultimaAcao.tarefa?.id);
        if (index !== -1) {
          tarefas.splice(index, 1);
        }
        break;
      }

      case 'status': {
        const index = tarefas.findIndex(t => t.id === ultimaAcao.tarefaNova?.id);
        if (index !== -1 && ultimaAcao.tarefaNova) {
          tarefas[index] = this.clonarTarefa(ultimaAcao.tarefaNova);
        }
        break;
      }
    }

    this.pilhaUndo.push(ultimaAcao);
    this.atualizarEstado(tarefas);
  }

  podeDesfazer(): boolean {
    return this.pilhaUndo.length > 0;
  }

  podeRefazer(): boolean {
    return this.pilhaRedo.length > 0;
  }

  limparHistorico(): void {
    this.pilhaUndo = [];
    this.pilhaRedo = [];
    this.saveUndoToStorage();
    this.saveRedoToStorage();
  }
}