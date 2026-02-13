import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResponseInput } from '../../src/components/ResponseInput';
import type { InputConfig } from '../../src/components/ResponseInput';

const textConfig: InputConfig = { type: 'text', placeholder: 'Type here' };

const choiceConfig: InputConfig = {
  type: 'multiple-choice',
  choices: [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B', description: 'A description' },
    { id: 'c', label: 'Option C' },
  ],
};

const multiChoiceConfig: InputConfig = {
  type: 'multiple-choice',
  choices: [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
  ],
  allowMultiple: true,
};

const rankingConfig: InputConfig = {
  type: 'ranking',
  items: [
    { id: 'x', label: 'Item X' },
    { id: 'y', label: 'Item Y' },
    { id: 'z', label: 'Item Z' },
  ],
};

// ---- Text Input ----

describe('ResponseInput - text', () => {
  it('should render a text input', () => {
    render(<ResponseInput config={textConfig} value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'Your response' })).toBeInTheDocument();
  });

  it('should display placeholder', () => {
    render(<ResponseInput config={textConfig} value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={textConfig} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('should call onSubmit when Enter is pressed', () => {
    const onSubmit = vi.fn();
    render(<ResponseInput config={textConfig} value="hello" onChange={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });

  it('should not call onSubmit on Shift+Enter', () => {
    const onSubmit = vi.fn();
    render(<ResponseInput config={textConfig} value="hello" onChange={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show character count when maxLength is set', () => {
    const cfg: InputConfig = { type: 'text', maxLength: 100 };
    render(<ResponseInput config={cfg} value="hello" onChange={vi.fn()} />);
    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });

  it('should render textarea when multiline is true', () => {
    const cfg: InputConfig = { type: 'text', multiline: true };
    render(<ResponseInput config={cfg} value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should disable input when disabled prop is set', () => {
    render(<ResponseInput config={textConfig} value="" onChange={vi.fn()} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should disable submit button when value is empty', () => {
    render(<ResponseInput config={textConfig} value="" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Submit response' })).toBeDisabled();
  });

  it('should enable submit button when value is non-empty', () => {
    render(<ResponseInput config={textConfig} value="hello" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Submit response' })).not.toBeDisabled();
  });

  it('should call onSubmit when submit button is clicked', () => {
    const onSubmit = vi.fn();
    render(<ResponseInput config={textConfig} value="hello" onChange={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });

  it('should hide submit button when showSubmit is false', () => {
    render(<ResponseInput config={textConfig} value="" onChange={vi.fn()} showSubmit={false} />);
    expect(screen.queryByRole('button', { name: 'Submit response' })).not.toBeInTheDocument();
  });

  it('should show custom submit label', () => {
    render(<ResponseInput config={textConfig} value="x" onChange={vi.fn()} submitLabel="Lock In" />);
    expect(screen.getByText('Lock In')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ResponseInput config={textConfig} value="" onChange={vi.fn()} className="my-class" />);
    expect(container.querySelector('.my-class')).toBeInTheDocument();
  });
});

// ---- Multiple Choice Input ----

describe('ResponseInput - multiple-choice', () => {
  it('should render all choices', () => {
    render(<ResponseInput config={choiceConfig} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('should show choice description when provided', () => {
    render(<ResponseInput config={choiceConfig} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('should call onChange with selected choice id on click', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={choiceConfig} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Option A'));
    expect(onChange).toHaveBeenCalledWith(['a']);
  });

  it('should mark selected choice with aria-pressed', () => {
    render(<ResponseInput config={choiceConfig} value={['b']} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    // Find Option B button
    const optionB = buttons.find(b => b.textContent?.includes('Option B'));
    expect(optionB).toHaveAttribute('aria-pressed', 'true');
  });

  it('should replace selection in single-choice mode', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={choiceConfig} value={['a']} onChange={onChange} />);
    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('should allow multiple selections when allowMultiple is true', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={multiChoiceConfig} value={['a']} onChange={onChange} />);
    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should deselect when clicking already-selected item with allowMultiple', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={multiChoiceConfig} value={['a', 'b']} onChange={onChange} />);
    fireEvent.click(screen.getByText('Option A'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('should disable buttons when disabled', () => {
    render(<ResponseInput config={choiceConfig} value={[]} onChange={vi.fn()} disabled />);
    const buttons = screen.getAllByRole('button');
    // Choice buttons are disabled
    const choiceButtons = buttons.filter(b => ['Option A', 'Option B', 'Option C'].some(l => b.textContent?.includes(l)));
    choiceButtons.forEach(b => expect(b).toBeDisabled());
  });

  it('should disable submit when no choice selected', () => {
    render(<ResponseInput config={choiceConfig} value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Submit response' })).toBeDisabled();
  });

  it('should enable submit when a choice is selected', () => {
    render(<ResponseInput config={choiceConfig} value={['a']} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Submit response' })).not.toBeDisabled();
  });
});

// ---- Ranking Input ----

describe('ResponseInput - ranking', () => {
  it('should show all items in unranked pool initially', () => {
    render(<ResponseInput config={rankingConfig} value={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Add Item X to ranking')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Item Y to ranking')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Item Z to ranking')).toBeInTheDocument();
  });

  it('should add item to ranking when clicked from pool', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={rankingConfig} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Add Item X to ranking'));
    expect(onChange).toHaveBeenCalledWith(['x']);
  });

  it('should show ranked items with rank numbers', () => {
    render(<ResponseInput config={rankingConfig} value={['x', 'y']} onChange={vi.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should move item up in ranking', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={rankingConfig} value={['x', 'y', 'z']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Move Item Y up'));
    expect(onChange).toHaveBeenCalledWith(['y', 'x', 'z']);
  });

  it('should move item down in ranking', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={rankingConfig} value={['x', 'y', 'z']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Move Item Y down'));
    expect(onChange).toHaveBeenCalledWith(['x', 'z', 'y']);
  });

  it('should disable move up for first item', () => {
    render(<ResponseInput config={rankingConfig} value={['x', 'y']} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Move Item X up')).toBeDisabled();
  });

  it('should disable move down for last item', () => {
    render(<ResponseInput config={rankingConfig} value={['x', 'y']} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Move Item Y down')).toBeDisabled();
  });

  it('should remove item from ranking', () => {
    const onChange = vi.fn();
    render(<ResponseInput config={rankingConfig} value={['x', 'y']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Remove Item X from ranking'));
    expect(onChange).toHaveBeenCalledWith(['y']);
  });

  it('should move item back to unranked pool after removal', () => {
    render(<ResponseInput config={rankingConfig} value={['x', 'y']} onChange={vi.fn()} />);
    // Item Z should still be in unranked pool
    expect(screen.getByLabelText('Add Item Z to ranking')).toBeInTheDocument();
  });

  it('should disable submit when no items ranked', () => {
    render(<ResponseInput config={rankingConfig} value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Submit response' })).toBeDisabled();
  });

  it('should enable submit when items are ranked', () => {
    render(<ResponseInput config={rankingConfig} value={['x']} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Submit response' })).not.toBeDisabled();
  });
});
