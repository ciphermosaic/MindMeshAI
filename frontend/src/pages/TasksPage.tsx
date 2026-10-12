import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  ExternalLink,
  Kanban,
  List,
  Check,
  RotateCcw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { TaskModal } from '../components/tasks/TaskModal';
import { Task, TaskStatus, PriorityLevel, ConnectorSource } from '../types';

export const TasksPage: React.FC = () => {
  const { tasks, updateTask, deleteTask, setInspectingSource } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || t.priority === priorityFilter;

    const matchesSource =
      sourceFilter === 'all' || t.source === sourceFilter;

    return matchesSearch && matchesPriority && matchesSource;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Tasks Management</h2>
          <p className="text-xs text-muted-foreground">
            Extracted action items and project tasks with source traceability
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, categories, or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="gmail">Gmail</option>
            <option value="manual">Manual</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-card border border-border text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'board' ? 'bg-secondary text-foreground font-bold' : 'text-muted-foreground'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-secondary text-foreground font-bold' : 'text-muted-foreground'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="p-4 rounded-3xl bg-secondary/30 border border-border space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                To Do
              </span>
              <span className="text-xs font-mono text-muted-foreground">{todoTasks.length}</span>
            </div>

            <div className="space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-card border border-border shadow-subtle hover:border-primary/40 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="priority" priority={task.priority} />
                    <Badge variant="source" source={task.source} />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-2 border-t border-border">
                    <span>{task.category}</span>
                    <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleStatusChange(task.id, 'in_progress')}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Start</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1">
                      {task.sourceMetadata && (
                        <button
                          onClick={() => setInspectingSource(task.sourceMetadata!)}
                          className="p-1 rounded text-muted-foreground hover:text-primary"
                          title="Provenance"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="p-4 rounded-3xl bg-secondary/30 border border-border space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                In Progress
              </span>
              <span className="text-xs font-mono text-muted-foreground">{inProgressTasks.length}</span>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-card border border-border shadow-subtle hover:border-indigo-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="priority" priority={task.priority} />
                    <Badge variant="source" source={task.source} />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-2 border-t border-border">
                    <span>{task.category}</span>
                    <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className="text-[11px] font-semibold text-emerald-500 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {task.sourceMetadata && (
                        <button
                          onClick={() => setInspectingSource(task.sourceMetadata!)}
                          className="p-1 rounded text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="p-4 rounded-3xl bg-secondary/30 border border-border space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="text-xs font-mono text-muted-foreground">{completedTasks.length}</span>
            </div>

            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-card/60 border border-border opacity-75 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="status" status="completed" />
                    <Badge variant="source" source={task.source} />
                  </div>

                  <h4 className="text-xs font-bold text-muted-foreground line-through">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground font-mono">
                    <button
                      onClick={() => handleStatusChange(task.id, 'todo')}
                      className="hover:text-primary underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-4 rounded-3xl bg-card border border-border shadow-subtle divide-y divide-border">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() =>
                    handleStatusChange(
                      task.id,
                      task.status === 'completed' ? 'todo' : 'completed'
                    )
                  }
                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                />
                <div className="space-y-0.5">
                  <h4
                    className={`text-xs font-bold ${
                      task.status === 'completed'
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span className="font-mono">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="priority" priority={task.priority} />
                <Badge variant="source" source={task.source} />
                <button
                  onClick={() => handleEdit(task)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
