import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { VotingInterface } from './VotingInterface';

const meta: Meta<typeof VotingInterface> = {
  title: 'Bonfire/VotingInterface',
  component: VotingInterface,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof VotingInterface>;

const options = [
  { id: 'a', label: 'A sentient toaster that gives life advice' },
  { id: 'b', label: 'An umbrella that hates rain' },
  { id: 'c', label: 'A calendar that procrastinates' },
  { id: 'd', label: 'A GPS that judges your route choices' },
];

const optionsWithAuthors = [
  { id: 'a', label: 'A sentient toaster that gives life advice', author: 'Alice' },
  { id: 'b', label: 'An umbrella that hates rain', author: 'Bob' },
  { id: 'c', label: 'A calendar that procrastinates', author: 'Charlie' },
];

export const Default: Story = {
  args: {
    title: 'Vote for the funniest answer',
    options,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Interactive: Story = {
  render: () => {
    const [vote, setVote] = useState<string | undefined>(undefined);
    return (
      <div className="w-96">
        <VotingInterface
          title="Which answer is funniest?"
          options={options}
          currentVote={vote}
          onVote={setVote}
        />
        {vote && (
          <p className="mt-4 text-sm text-center text-gray-500">
            You voted for: <strong>{options.find((o) => o.id === vote)?.label}</strong>
          </p>
        )}
      </div>
    );
  },
};

export const WithResults: Story = {
  args: {
    title: 'Round Results',
    options: optionsWithAuthors,
    currentVote: 'b',
    showResults: true,
    voteCounts: { a: 3, b: 7, c: 2 },
    totalVoters: 12,
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const AllVotesSame: Story = {
  args: {
    title: 'Results — Unanimous!',
    options: [
      { id: 'a', label: 'The obvious winner', author: 'Alice' },
      { id: 'b', label: 'Second place', author: 'Bob' },
      { id: 'c', label: 'Third place', author: 'Charlie' },
    ],
    showResults: true,
    voteCounts: { a: 10, b: 0, c: 0 },
    totalVoters: 10,
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    title: 'Voting is closed',
    options,
    currentVote: 'a',
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithDescriptions: Story = {
  args: {
    title: 'What would you rather do?',
    options: [
      { id: 'a', label: 'Fly', description: 'Soar through the sky at will' },
      { id: 'b', label: 'Be invisible', description: 'Phase through walls, go unseen' },
      { id: 'c', label: 'Read minds', description: 'Know what anyone is thinking' },
      { id: 'd', label: 'Time travel', description: 'Visit any point in history' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};
