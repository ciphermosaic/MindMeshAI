import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Deadline, PriorityLevel, ConnectorSource } from '../../types';
import { useApp } from '../../context/AppContext';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({ isOpen, onClose }) => {
  const { createDeadline } = useApp();

  const [title, setTitle] = useState('');
  const [courseOrProject, setCourseOrProject] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [weightage, setWeightage] = useState('20% of Grade');
  const [remindMeBeforeHours, setRemindMeBeforeHours] = useState(24);
  const [source, setSource] = useState<ConnectorSource>('manual');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createDeadline({
      title,
      courseOrProject,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      status: 'upcoming',
      weightage,
      remindMeBeforeHours,
      source,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Deadline"
      description="Record key milestones, exam dates, or project deliverables"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1">Deadline Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Systems Lab 3 Submission"
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">Course / Project</label>
          <input
            type="text"
            value={courseOrProject}
            onChange={(e) => setCourseOrProject(e.target.value)}
            placeholder="e.g. CS 451: Distributed Systems"
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Weightage / Impact</label>
            <input
              type="text"
              value={weightage}
              onChange={(e) => setWeightage(e.target.value)}
              placeholder="e.g. 25% of Grade"
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Remind Ahead</label>
            <select
              value={remindMeBeforeHours}
              onChange={(e) => setRemindMeBeforeHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={6}>6 hours before</option>
              <option value={12}>12 hours before</option>
              <option value={24}>24 hours before</option>
              <option value={48}>48 hours before</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
          >
            Save Deadline
          </button>
        </div>
      </form>
    </Modal>
  );
};
