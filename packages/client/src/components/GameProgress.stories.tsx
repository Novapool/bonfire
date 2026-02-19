import type { Meta, StoryObj } from '@storybook/react';
import { GameProgress } from './GameProgress';

const meta: Meta<typeof GameProgress> = {
  title: 'Bonfire/GameProgress',
  component: GameProgress,
  parameters: {
    layout: 'centered',
  },
  args: {
    current: 3,
    total: 8,
    variant: 'bar',
  },
};

export default meta;
type Story = StoryObj<typeof GameProgress>;

export const Bar: Story = {
  args: {
    variant: 'bar',
    label: 'Round 3 of 8',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Dots: Story = {
  args: {
    variant: 'dots',
    current: 3,
    total: 8,
    label: 'Question 3 of 8',
  },
  decorators: [
    (Story) => (
      <div className="w-72 flex justify-center">
        <Story />
      </div>
    ),
  ],
};

export const Number: Story = {
  args: {
    variant: 'number',
    label: 'Round',
  },
  decorators: [
    (Story) => (
      <div className="w-40 text-center">
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 w-72">
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">Bar</p>
        <GameProgress current={4} total={10} variant="bar" label="Round 4 of 10" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">Dots</p>
        <GameProgress current={4} total={10} variant="dots" label="Question 4 of 10" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">Number</p>
        <GameProgress current={4} total={10} variant="number" label="Round" />
      </div>
    </div>
  ),
};

export const Complete: Story = {
  args: {
    current: 8,
    total: 8,
    variant: 'bar',
    label: 'All rounds complete!',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export const Start: Story = {
  args: {
    current: 1,
    total: 8,
    variant: 'dots',
    label: 'First round',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
