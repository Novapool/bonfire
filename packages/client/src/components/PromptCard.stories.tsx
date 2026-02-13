import type { Meta, StoryObj } from '@storybook/react';
import { PromptCard } from './PromptCard';
import { Timer } from './Timer';

const meta: Meta<typeof PromptCard> = {
  title: 'Bonfire/PromptCard',
  component: PromptCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    prompt: 'If you could only eat one food for the rest of your life, what would it be?',
    variant: 'standard',
  },
};

export default meta;
type Story = StoryObj<typeof PromptCard>;

export const Standard: Story = {};

export const Spicy: Story = {
  args: {
    variant: 'spicy',
    prompt: 'What is the most embarrassing thing you\'ve done to impress someone?',
    category: 'Hot Takes',
  },
};

export const Creative: Story = {
  args: {
    variant: 'creative',
    prompt: 'Invent a superpower that is useful in exactly one very specific situation.',
    category: 'Imagination',
  },
};

export const Dare: Story = {
  args: {
    variant: 'dare',
    prompt: 'Do your best impression of a famous person. Everyone votes on who it is.',
    category: 'Performance',
  },
};

export const WithRound: Story = {
  args: {
    round: 2,
    totalRounds: 5,
    prompt: 'Name something you would find in a dentist\'s office.',
  },
};

export const WithSubtitle: Story = {
  args: {
    variant: 'creative',
    prompt: 'Write a two-sentence horror story.',
    subtitle: 'You have 60 seconds. Make it count.',
  },
};

export const WithTimer: Story = {
  args: {
    prompt: 'Describe your ideal weekend in exactly five words.',
    subtitle: 'Everyone answers simultaneously.',
  },
  render: (args) => (
    <PromptCard {...args}>
      <div className="flex justify-center">
        <Timer duration={30} showProgress size="sm" autoStart={false} />
      </div>
    </PromptCard>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <PromptCard variant="standard" prompt="What's your go-to karaoke song?" round={1} totalRounds={5} />
      <PromptCard variant="spicy" prompt="What habit do your friends probably judge you for?" />
      <PromptCard variant="creative" prompt="What object in this room would be the worst weapon in a zombie apocalypse?" />
      <PromptCard variant="dare" prompt="Show everyone your most recent photo in your camera roll." />
    </div>
  ),
};
