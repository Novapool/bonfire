import React, { useState, useRef, useEffect } from 'react';

// ---- Types ----

export interface TextInputConfig {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}

export interface Choice {
  id: string;
  label: string;
  description?: string;
}

export interface MultipleChoiceConfig {
  type: 'multiple-choice';
  choices: Choice[];
  allowMultiple?: boolean;
}

export interface RankingConfig {
  type: 'ranking';
  items: Choice[];
}

export type InputConfig = TextInputConfig | MultipleChoiceConfig | RankingConfig;

export interface ResponseInputProps {
  /** Input configuration — determines mode */
  config: InputConfig;
  /** Controlled value */
  value?: string | string[];
  /** Called on every change */
  onChange?: (value: string | string[]) => void;
  /** Called when user submits */
  onSubmit?: (value: string | string[]) => void;
  /** Disable all inputs (e.g., after submitting) */
  disabled?: boolean;
  /** Show submit button */
  showSubmit?: boolean;
  /** Submit button label */
  submitLabel?: string;
  /** Additional CSS classes for the root element */
  className?: string;
}

// ---- Sub-components ----

interface TextInputProps {
  config: TextInputConfig;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ config, value, onChange, onSubmit, disabled }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !config.multiline && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const sharedProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onKeyDown: handleKeyDown,
    disabled,
    maxLength: config.maxLength,
    placeholder: config.placeholder || 'Type your answer…',
    className: `w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-primary focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed bg-surface`,
    'aria-label': 'Your response',
  };

  return config.multiline ? (
    <div>
      <textarea {...sharedProps} rows={3} />
      {config.maxLength && (
        <div className="text-right text-xs text-text-secondary mt-1">
          {value.length} / {config.maxLength}
        </div>
      )}
    </div>
  ) : (
    <div>
      <input type="text" {...sharedProps} />
      {config.maxLength && (
        <div className="text-right text-xs text-text-secondary mt-1">
          {value.length} / {config.maxLength}
        </div>
      )}
    </div>
  );
};

interface MultipleChoiceInputProps {
  config: MultipleChoiceConfig;
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}

const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({ config, value, onChange, disabled }) => {
  const toggle = (id: string) => {
    if (config.allowMultiple) {
      onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    } else {
      onChange([id]);
    }
  };

  return (
    <div className="space-y-2" role={config.allowMultiple ? 'group' : 'radiogroup'} aria-label="Answer choices">
      {config.choices.map((choice) => {
        const selected = value.includes(choice.id);
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => !disabled && toggle(choice.id)}
            disabled={disabled}
            aria-pressed={selected}
            className={`
              w-full text-left px-4 py-3 rounded-lg border-2 transition-all
              ${selected
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
                : 'border-gray-200 bg-surface text-text-primary hover:border-brand-primary/50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `.trim()}
          >
            <span className="font-medium">{choice.label}</span>
            {choice.description && (
              <span className="block text-sm text-text-secondary font-normal mt-0.5">
                {choice.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

interface RankingInputProps {
  config: RankingConfig;
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}

const RankingInput: React.FC<RankingInputProps> = ({ config, value, onChange, disabled }) => {
  // value is ordered list of item IDs; items not yet ranked stay in unranked pool
  const ranked = value.map((id) => config.items.find((i) => i.id === id)).filter(Boolean) as Choice[];
  const unranked = config.items.filter((i) => !value.includes(i.id));

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const addToRanking = (id: string) => {
    onChange([...value, id]);
  };

  const removeFromRanking = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className="space-y-4">
      {/* Ranked list */}
      {ranked.length > 0 && (
        <div className="space-y-2" aria-label="Your ranking">
          {ranked.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-brand-primary/30 bg-brand-primary/5"
            >
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-text-primary font-medium">{item.label}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={disabled || index === 0}
                  aria-label={`Move ${item.label} up`}
                  className="p-1 rounded hover:bg-brand-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={disabled || index === ranked.length - 1}
                  aria-label={`Move ${item.label} down`}
                  className="p-1 rounded hover:bg-brand-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeFromRanking(item.id)}
                  disabled={disabled}
                  aria-label={`Remove ${item.label} from ranking`}
                  className="p-1 rounded hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unranked pool */}
      {unranked.length > 0 && (
        <div className="space-y-2">
          {ranked.length > 0 && (
            <p className="text-xs text-text-secondary">Tap to add to ranking:</p>
          )}
          {unranked.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => !disabled && addToRanking(item.id)}
              disabled={disabled}
              aria-label={`Add ${item.label} to ranking`}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 bg-surface text-text-secondary hover:border-brand-primary/50 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Main component ----

/**
 * Polymorphic input component for collecting player responses.
 * Supports text, multiple-choice (single or multi-select), and ranking modes.
 */
export const ResponseInput: React.FC<ResponseInputProps> = ({
  config,
  value,
  onChange,
  onSubmit,
  disabled = false,
  showSubmit = true,
  submitLabel = 'Submit',
  className = '',
}) => {
  // Normalize controlled value
  const isText = config.type === 'text';
  const internalValue: string | string[] = value ?? (isText ? '' : []);

  const handleChange = (v: string | string[]) => onChange?.(v);
  const handleSubmit = () => {
    if (internalValue !== '' || (Array.isArray(internalValue) && internalValue.length > 0)) {
      onSubmit?.(internalValue);
    }
  };

  const canSubmit = isText
    ? (internalValue as string).trim().length > 0
    : (internalValue as string[]).length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {config.type === 'text' && (
        <TextInput
          config={config}
          value={internalValue as string}
          onChange={(v) => handleChange(v)}
          onSubmit={handleSubmit}
          disabled={disabled}
        />
      )}

      {config.type === 'multiple-choice' && (
        <MultipleChoiceInput
          config={config}
          value={internalValue as string[]}
          onChange={(v) => handleChange(v)}
          disabled={disabled}
        />
      )}

      {config.type === 'ranking' && (
        <RankingInput
          config={config}
          value={internalValue as string[]}
          onChange={(v) => handleChange(v)}
          disabled={disabled}
        />
      )}

      {showSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !canSubmit}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-all
            ${canSubmit && !disabled
              ? 'bg-brand-primary text-white hover:bg-brand-secondary cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `.trim()}
          aria-label="Submit response"
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
};
