import { Tarefa } from './tarefa';

export interface AcaoHistorico {
  tipo: 'criar' | 'editar' | 'excluir' | 'status';
  tarefa?: Tarefa;
  tarefaAnterior?: Tarefa;
  tarefaNova?: Tarefa;
  indice?: number;
}