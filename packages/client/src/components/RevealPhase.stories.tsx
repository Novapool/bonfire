import type { Meta, StoryObj } from '@storybook/react';
import { RevealPhase } from './RevealPhase';

const meta: Meta<typeof RevealPhase> = {
  title: 'Bonfire/RevealPhase',
  component: RevealPhase,
  parameters: {
    layout: 'centered',
  },
  args: {
    revealDelay: 800,
    revealAll: false,
  },
};

export default meta;
type Story = StoryObj<typeof RevealPhase>;

const leaderboardItems = [
  { id: '1', label: 'Alice', sublabel: 'Most creative answer', meta: '1,200 pts' },
  { id: '2', label: 'Bob', sublabel: 'Quick and clever', meta: '950 pts' },
  { id: '3', label: 'Charlie', sublabel: 'Audience favorite', meta: '800 pts' },
  { id: '4', label: 'Diana', sublabel: 'Consistently funny', meta: '720 pts' },
];

const answerItems = [
  { id: 'a1', label: 'A sentient toaster that gives life advice', sublabel: 'Submitted by Alice' },
  { id: 'a2', label: 'An umbrella that hates rain', sublabel: 'Submitted by Bob' },
  { id: 'a3', label: 'A calendar that procrastinates', sublabel: 'Submitted by Charlie' },
];

export const Default: Story = {
  args: {
    title: 'Round Results',
    items: leaderboardItems,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const RevealAll: Story = {
  args: {
    title: 'Final Leaderboard',
    items: leaderboardItems,
    revealAll: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const AnswerReveal: Story = {
  args: {
    title: 'Everyone\'s Answers',
    items: answerItems,
    revealAll: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const SlowReveal: Story = {
  args: {
    title: 'Dramatic Reveal…',
    items: leaderboardItems,
    revealDelay: 1500,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const CustomRender: Story = {
  args: {
    title: 'Top Players',
    items: leaderboardItems,
    revealAll: true,
    renderItem: (item, index, revealed) => (
      <div
        className={`flex items-center gap-3 p-4 rounded-xl bg-surface border-2 transition-all duration-500 ${
          revealed ? 'border-yellow-300 opacity-100' : 'border-transparent opacity-0'
        }`}
        aria-hidden={!revealed}
      >
        <span className="text-2xl">{['🥇', '🥈', '🥉', '4️⃣'][index] ?? `${index + 1}`}</span>
        <span className="flex-1 font-bold text-text-primary">{item.label}</span>
        <span className="font-mono font-semibold text-brand-primary">{item.meta}</span>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
