import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lobby } from './Lobby';

const meta = {
  title: 'Components/Lobby',
  component: Lobby,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Lobby>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomRoomCode: Story = {
  args: {
    roomCode: 'PARTY1',
  },
};

export const NotHost: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'View from a non-host player. The start button is replaced with a waiting message.',
      },
    },
  },
};

export const WithReadyStates: Story = {
  args: {
    showReadyStates: true,
  },
};

export const HideStartButton: Story = {
  args: {
    hideStartButton: true,
  },
};

export const CustomPlayerRenderer: Story = {
  args: {
    renderPlayer: (player, isHost) => (
      <div className="flex items-center gap-2 p-2 bg-purple-100 rounded">
        <span className="font-bold">{player.name}</span>
        {isHost && <span className="text-xs">👑</span>}
      </div>
    ),
  },
};

export const WaitingForPlayers: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Lobby with fewer than minimum players. Start button is disabled.',
      },
    },
  },
};

export const FullLobby: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Lobby at maximum capacity (8/8 players).',
      },
    },
  },
};
