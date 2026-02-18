import { useState, useCallback, useEffect, useRef } from 'react';
import type { BoardData } from '../../../../src/types/index';
import { createStory } from '../../lib/api';

interface CreateStoryModalProps {
  board: BoardData;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateStoryModal({
  board,
  open,
  onClose,
  onCreated,
}: CreateStoryModalProps) {
  const [featureId, setFeatureId] = useState('');
  const [epicNum, setEpicNum] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [want, setWant] = useState('');
  const [soThat, setSoThat] = useState('');
  const [acList, setAcList] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFeatureId(board.features[0]?.id || '');
      setEpicNum('');
      setTitle('');
      setRole('');
      setWant('');
      setSoThat('');
      setAcList(['']);
      setError(null);
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open, board.features]);

  const availableEpics = featureId
    ? board.features
        .find((f) => f.id === featureId)
        ?.epicIds.map((id) => board.epics[id])
        .filter(Boolean) ?? []
    : [];

  useEffect(() => {
    if (availableEpics.length > 0 && !epicNum) {
      setEpicNum(availableEpics[0].num);
    }
  }, [availableEpics, epicNum]);

  const handleAcChange = useCallback((index: number, value: string) => {
    setAcList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addAc = useCallback(() => {
    setAcList((prev) => [...prev, '']);
  }, []);

  const removeAc = useCallback((index: number) => {
    setAcList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!featureId || !epicNum || !title.trim()) {
        setError('Feature, epic, and title are required.');
        return;
      }

      const acceptanceCriteria = acList
        .map((ac) => ac.trim())
        .filter(Boolean);

      setSubmitting(true);
      try {
        await createStory({
          featureId,
          epicNum,
          title: title.trim(),
          role: role.trim() || 'user',
          want: want.trim() || title.trim(),
          soThat: soThat.trim() || 'I can accomplish my goal',
          acceptanceCriteria:
            acceptanceCriteria.length > 0
              ? acceptanceCriteria
              : ['Implementation meets requirements'],
        });
        onCreated();
        onClose();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
    [featureId, epicNum, title, role, want, soThat, acList, onCreated, onClose]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg-surface border border-border rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">
            New Story
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Feature + Epic row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Feature">
              <select
                value={featureId}
                onChange={(e) => {
                  setFeatureId(e.target.value);
                  setEpicNum('');
                }}
                className="select-field"
              >
                {board.features.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.icon} {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Epic">
              <select
                value={epicNum}
                onChange={(e) => setEpicNum(e.target.value)}
                className="select-field"
              >
                <option value="">Select epic...</option>
                {availableEpics.map((epic) => (
                  <option key={epic.id} value={epic.num}>
                    E{epic.num}: {epic.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Title */}
          <Field label="Title">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short description of the story..."
              className="input-field"
              required
            />
          </Field>

          {/* User story */}
          <fieldset className="space-y-3 border border-border rounded-md p-3">
            <legend className="text-[10px] text-text-muted uppercase tracking-wider px-1">
              User Story
            </legend>
            <Field label="As a...">
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="user, parent, admin..."
                className="input-field"
              />
            </Field>
            <Field label="I want...">
              <input
                type="text"
                value={want}
                onChange={(e) => setWant(e.target.value)}
                placeholder="to do something..."
                className="input-field"
              />
            </Field>
            <Field label="So that...">
              <input
                type="text"
                value={soThat}
                onChange={(e) => setSoThat(e.target.value)}
                placeholder="I can achieve a goal..."
                className="input-field"
              />
            </Field>
          </fieldset>

          {/* Acceptance Criteria */}
          <fieldset className="space-y-2 border border-border rounded-md p-3">
            <legend className="text-[10px] text-text-muted uppercase tracking-wider px-1">
              Acceptance Criteria
            </legend>
            {acList.map((ac, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-[11px] text-text-muted mt-2 w-5 text-right shrink-0">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={ac}
                  onChange={(e) => handleAcChange(index, e.target.value)}
                  placeholder="Given... When... Then..."
                  className="input-field flex-1"
                />
                {acList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAc(index)}
                    className="text-text-muted hover:text-red-400 transition-colors text-[13px] px-1"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAc}
              className="text-[12px] text-accent hover:text-accent-hover transition-colors"
            >
              + Add criteria
            </button>
          </fieldset>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-400 bg-red-400/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-[13px] font-medium bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-md transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-text-secondary mb-1 block">{label}</span>
      {children}
    </label>
  );
}
