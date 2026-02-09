import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useRoom } from '../../src/hooks/useRoom';
import { renderWithProvider } from '../fixtures/renderWithProvider';
import { MockBonfireClient } from '../fixtures/mockBonfireClient';

describe('useRoom', () => {
  it('should return null roomId and isInRoom=false initially', () => {
    const { result } = renderWithProvider(() => useRoom());
    expect(result.current.roomId).toBeNull();
    expect(result.current.isInRoom).toBe(false);
  });

  it('should call createRoom on the client', async () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => useRoom(), client);

    await act(async () => {
      const response = await result.current.createRoom('trivia', 'Alice');
      expect(response.success).toBe(true);
      expect(response.roomId).toBe('ABCDEF');
    });

    expect(client.createRoom).toHaveBeenCalledWith('trivia', 'Alice');
  });

  it('should call joinRoom on the client', async () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => useRoom(), client);

    await act(async () => {
      const response = await result.current.joinRoom('XYZABC', 'Bob');
      expect(response.success).toBe(true);
    });

    expect(client.joinRoom).toHaveBeenCalledWith('XYZABC', 'Bob');
  });

  it('should call leaveRoom on the client', async () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => useRoom(), client);

    await act(async () => {
      const response = await result.current.leaveRoom();
      expect(response.success).toBe(true);
    });

    expect(client.leaveRoom).toHaveBeenCalled();
  });

  it('should call startGame on the client', async () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => useRoom(), client);

    await act(async () => {
      const response = await result.current.startGame();
      expect(response.success).toBe(true);
    });

    expect(client.startGame).toHaveBeenCalled();
  });

  it('should call sendAction on the client', async () => {
    const client = new MockBonfireClient();
    const { result } = renderWithProvider(() => useRoom(), client);

    await act(async () => {
      const response = await result.current.sendAction('answer', { text: 'hello' });
      expect(response.success).toBe(true);
    });

    expect(client.sendAction).toHaveBeenCalledWith('answer', { text: 'hello' });
  });
});
