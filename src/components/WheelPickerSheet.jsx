import { useId, useLayoutEffect, useRef, useState } from 'react';
import { haptic, startHapticSelection } from '../utils/haptics.js';
import { BottomSheet } from './CommonUI.jsx';
import './WheelPickerSheet.css';

const ROW_HEIGHT = 44;

function getColumns(columns, values) {
  return typeof columns === 'function' ? columns(values) : columns;
}

function fitValues(columns, values) {
  return Object.fromEntries(columns.map(({ id, options }) => {
    const value = values[id];
    const exact = options.find((option) => option.value === value);
    if (exact) return [id, exact.value];

    const nearest = typeof value === 'number'
      ? options.reduce((best, option) => {
          if (typeof option.value !== 'number') return best;
          if (!best || Math.abs(option.value - value) < Math.abs(best.value - value)) return option;
          return best;
        }, null)
      : null;
    return [id, nearest?.value ?? options[0]?.value];
  }));
}

function indexAtScroll(track, optionCount) {
  return Math.max(0, Math.min(optionCount - 1, Math.round(track.scrollTop / ROW_HEIGHT)));
}

function WheelColumn({ column, value, onChange, tracks }) {
  const { id, label, options } = column;
  const listId = useId();
  const track = useRef(null);
  const observedIndex = useRef(-1);
  const selectedIndex = options.findIndex((option) => option.value === value);

  useLayoutEffect(() => {
    const element = track.current;
    tracks.current.set(id, element);
    return () => tracks.current.delete(id);
  }, [id, tracks]);

  useLayoutEffect(() => {
    if (selectedIndex < 0 || selectedIndex === observedIndex.current) return;
    track.current.scrollTop = selectedIndex * ROW_HEIGHT;
    observedIndex.current = selectedIndex;
  }, [selectedIndex]);

  function updateSelection(index) {
    const indexChanged = observedIndex.current !== index;
    observedIndex.current = index;
    const option = options[index];
    if (option && indexChanged) void haptic.tick();
    if (option && option.value !== value) onChange(id, option.value);
  }

  function selectIndex(index) {
    if (options.length === 0) return;
    const nextIndex = Math.max(0, Math.min(options.length - 1, index));
    track.current.scrollTop = nextIndex * ROW_HEIGHT;
    updateSelection(nextIndex);
  }

  function handleKeyDown(event) {
    const current = indexAtScroll(event.currentTarget, options.length);
    const targets = {
      ArrowUp: current - 1,
      ArrowDown: current + 1,
      PageUp: current - 5,
      PageDown: current + 5,
      Home: 0,
      End: options.length - 1
    };
    const target = targets[event.key];
    if (typeof target !== 'number') return;
    event.preventDefault();
    selectIndex(target);
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 text-center text-[11px] font-semibold text-slate-500" aria-hidden="true">{label}</div>
      <div className="wheel-picker-column relative isolate rounded-2xl bg-slate-50">
        <div className="wheel-picker-highlight pointer-events-none absolute inset-x-1 rounded-xl border border-slate-200 bg-slate-100" />
        <div
          ref={track}
          className="wheel-picker-track relative no-scrollbar rounded-2xl text-center tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500"
          role="listbox"
          aria-label={label}
          aria-activedescendant={selectedIndex >= 0 ? `${listId}-${selectedIndex}` : undefined}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onScroll={(event) => updateSelection(indexAtScroll(event.currentTarget, options.length))}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={`wheel-picker-option flex cursor-pointer items-center justify-center px-1 text-[15px] ${
                index === selectedIndex ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
              }`}
              onClick={() => selectIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PickerContent({ columns, initialValues, onClose, onConfirm }) {
  const [draft, setDraft] = useState(() => fitValues(getColumns(columns, initialValues), initialValues));
  const tracks = useRef(new Map());
  const content = useRef(null);
  const visibleColumns = getColumns(columns, draft);

  useLayoutEffect(startHapticSelection, []);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement;
    content.current.querySelector('[role="listbox"]')?.focus({ preventScroll: true });
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = content.current.closest('[role="dialog"]');
    function keepFocus(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey ? document.activeElement === first : document.activeElement === last) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    }
    dialog.addEventListener('keydown', keepFocus);
    return () => dialog.removeEventListener('keydown', keepFocus);
  }, [onClose]);

  function changeValue(id, value) {
    setDraft((previous) => {
      if (previous[id] === value) return previous;
      const next = { ...previous, [id]: value };
      return fitValues(getColumns(columns, next), next);
    });
  }

  function confirm() {
    // Sample the visible rows directly in case momentum scrolling has not sent its final event.
    const visibleValues = Object.fromEntries(visibleColumns.map(({ id, options }) => {
      const track = tracks.current.get(id);
      const index = track ? indexAtScroll(track, options.length) : -1;
      return [id, options[index]?.value ?? draft[id]];
    }));
    onConfirm(fitValues(getColumns(columns, visibleValues), visibleValues));
  }

  return (
    <div ref={content} style={{ '--wheel-row-height': `${ROW_HEIGHT}px` }} className="space-y-4">
      <div className="flex gap-2.5">
        {visibleColumns.map((column) => (
          <WheelColumn key={column.id} column={column} value={draft[column.id]} onChange={changeValue} tracks={tracks} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 active:scale-[0.98] transition">取消</button>
        <button
          type="button"
          onClick={confirm}
          disabled={!visibleColumns.length || visibleColumns.some(({ options }) => !options.length)}
          className="rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition disabled:opacity-50"
        >
          确认
        </button>
      </div>
    </div>
  );
}

export function WheelPickerSheet({ open, title, subtitle, columns, initialValues, onClose, onConfirm }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} subtitle={subtitle} bodyClassName="px-5 py-4 pb-5" layerClassName="z-[60]">
      <PickerContent key={title} columns={columns} initialValues={initialValues} onClose={onClose} onConfirm={onConfirm} />
    </BottomSheet>
  );
}
