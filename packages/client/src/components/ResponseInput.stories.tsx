import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ResponseInput } from './ResponseInput';
import { PromptCard } from './PromptCard';

const meta: Meta<typeof ResponseInput> = {
  title: 'Bonfire/ResponseInput',
  component: ResponseInput,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ResponseInput>;

// ---- Text Input ----

export const TextInput: Story = {
  args: {
    config: {
      type: 'text',
      placeholder: 'Type your answer here…',
      maxLength: 120,
    },
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div className="w-96">
        <ResponseInput {...args} value={value} onChange={(v) => setValue(v as string)} onSubmit={(v) => alert(`Submitted: ${v}`)} />
      </div>
    );
  },
};

export const TextMultiline: Story = {
  args: {
    config: {
      type: 'text',
      multiline: true,
      placeholder: 'Tell your story…',
      maxLength: 280,
    },
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div className="w-96">
        <ResponseInput {...args} value={value} onChange={(v) => setValue(v as string)} />
      </div>
    );
  },
};

// ---- Multiple Choice ----

const choices = [
  { id: 'a', label: 'Pizza', description: 'The classic choice' },
  { id: 'b', label: 'Tacos', description: 'Every day is taco Tuesday' },
  { id: 'c', label: 'Sushi', description: 'Fresh and delicious' },
  { id: 'd', label: 'Burgers', description: 'Can\'t go wrong' },
];

export const SingleChoice: Story = {
  args: {
    config: {
      type: 'multiple-choice',
      choices,
    },
  },
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-96">
        <ResponseInput {...args} value={value} onChange={(v) => setValue(v as string[])} onSubmit={(v) => alert(`Submitted: ${v}`)} />
      </div>
    );
  },
};

export const MultipleChoice: Story = {
  args: {
    config: {
      type: 'multiple-choice',
      choices,
      allowMultiple: true,
    },
    submitLabel: 'Lock In',
  },
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-96">
        <ResponseInput {...args} value={value} onChange={(v) => setValue(v as string[])} />
      </div>
    );
  },
};

// ---- Ranking ----

const rankItems = [
  { id: 'morning', label: 'Morning person' },
  { id: 'night', label: 'Night owl' },
  { id: 'nap', label: 'Nap enthusiast' },
  { id: 'weekend', label: 'Weekend warrior' },
];

export const Ranking: Story = {
  args: {
    config: {
      type: 'ranking',
      items: rankItems,
    },
    showSubmit: true,
    submitLabel: 'Submit Ranking',
  },
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-96">
        <ResponseInput {...args} value={value} onChange={(v) => setValue(v as string[])} onSubmit={(v) => alert(`Ranking: ${(v as string[]).join(' > ')}`)} />
      </div>
    );
  },
};

// ---- Disabled State ----

export const Disabled: Story = {
  args: {
    config: {
      type: 'text',
      placeholder: 'Answer submitted!',
    },
    disabled: true,
    value: 'Pizza, obviously.',
  },
};

// ---- Full Game Example ----

export const InContext: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    return (
      <div className="w-96 space-y-4">
        <PromptCard
          variant="creative"
          prompt="Rank these survival skills from most to least important."
          round={3}
          totalRounds={5}
        />
        <ResponseInput
          config={{
            type: 'ranking',
            items: [
              { id: 'fire', label: 'Starting a fire' },
              { id: 'water', label: 'Finding water' },
              { id: 'shelter', label: 'Building shelter' },
              { id: 'food', label: 'Finding food' },
            ],
          }}
          value={value}
          onChange={(v) => setValue(v as string[])}
          onSubmit={() => setSubmitted(true)}
          disabled={submitted}
          submitLabel={submitted ? 'Submitted!' : 'Lock In Ranking'}
        />
      </div>
    );
  },
};
