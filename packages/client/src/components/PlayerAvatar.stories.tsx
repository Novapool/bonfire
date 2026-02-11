import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayerAvatar } from './PlayerAvatar';

const meta = {
  title: 'Components/PlayerAvatar',
  component: PlayerAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'color',
    },
  },
} satisfies Meta<typeof PlayerAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Alice Johnson',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <PlayerAvatar name="Alice" size="xs" />
      <PlayerAvatar name="Bob" size="sm" />
      <PlayerAvatar name="Charlie" size="md" />
      <PlayerAvatar name="Diana" size="lg" />
      <PlayerAvatar name="Eve" size="xl" />
    </div>
  ),
};

export const WithOnlineStatus: Story = {
  render: () => (
    <div className="flex gap-4">
      <PlayerAvatar name="Alice" size="lg" showStatus isOnline />
      <PlayerAvatar name="Bob" size="lg" showStatus isOnline={false} />
    </div>
  ),
};

export const HostBadge: Story = {
  args: {
    name: 'Alice (Host)',
    size: 'lg',
    isHost: true,
  },
};

export const HostWithStatus: Story = {
  args: {
    name: 'Game Master',
    size: 'lg',
    isHost: true,
    showStatus: true,
    isOnline: true,
  },
};

export const ColorVariety: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PlayerAvatar name="Alice" size="lg" />
      <PlayerAvatar name="Bob" size="lg" />
      <PlayerAvatar name="Charlie" size="lg" />
      <PlayerAvatar name="Diana" size="lg" />
      <PlayerAvatar name="Eve" size="lg" />
      <PlayerAvatar name="Frank" size="lg" />
      <PlayerAvatar name="Grace" size="lg" />
      <PlayerAvatar name="Henry" size="lg" />
    </div>
  ),
};

export const SingleNameInitials: Story = {
  render: () => (
    <div className="flex gap-4">
      <PlayerAvatar name="Alice" size="lg" />
      <PlayerAvatar name="Bob" size="lg" />
      <PlayerAvatar name="X" size="lg" />
    </div>
  ),
};

export const CustomColor: Story = {
  args: {
    name: 'Custom Player',
    size: 'lg',
    color: '#ec4899',
  },
};
