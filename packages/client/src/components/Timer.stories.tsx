import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timer } from './Timer';

const meta = {
  title: 'Components/Timer',
  component: Timer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'number', min: 5, max: 120 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof Timer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    duration: 30,
    autoStart: true,
  },
};

export const ShortCountdown: Story = {
  args: {
    duration: 10,
    autoStart: true,
  },
};

export const LongCountdown: Story = {
  args: {
    duration: 60,
    autoStart: true,
  },
};

export const WithoutProgress: Story = {
  args: {
    duration: 30,
    showProgress: false,
    autoStart: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Timer duration={30} size="sm" />
      <Timer duration={30} size="md" />
      <Timer duration={30} size="lg" />
    </div>
  ),
};

export const WarningVariant: Story = {
  args: {
    duration: 30,
    variant: 'warning',
    autoStart: true,
  },
};

export const DangerVariant: Story = {
  args: {
    duration: 30,
    variant: 'danger',
    autoStart: true,
  },
};

export const WithCallback: Story = {
  args: {
    duration: 5,
    autoStart: true,
    onComplete: () => alert('Time\'s up!'),
  },
};

export const AutoTransition: Story = {
  args: {
    duration: 20,
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Watch the timer automatically transition from default (blue) → warning (orange) at 50% → danger (red) at 25%',
      },
    },
  },
};
