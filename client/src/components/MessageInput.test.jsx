import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import socket from '../socket';
import MessageInput from './MessageInput';

vi.mock('../socket', () => ({
  default: {
    emit: vi.fn(),
    timeout: vi.fn(),
  },
}));

describe('MessageInput', () => {
  beforeEach(() => {
    socket.emit.mockReset();
    socket.timeout.mockReset();
    socket.timeout.mockReturnValue({
      emit: vi.fn((_event, _payload, callback) => callback(null, { ok: true })),
    });
  });

  it('sends typed text and clears the composer after acknowledgement', async () => {
    const user = userEvent.setup();
    render(<MessageInput onError={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /message/i });
    await user.type(input, 'Hello Bob');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(socket.timeout).toHaveBeenCalledWith(5000);
    expect(input).toHaveValue('');
  });

  it('opens the media picker and conversation ideas', async () => {
    const user = userEvent.setup();
    render(<MessageInput onError={vi.fn()} messages={[]} room='general' />);

    await user.click(screen.getByRole('button', { name: /add emoji/i }));
    expect(screen.getByLabelText(/emoji, sticker and meme picker/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show conversation ideas/i }));
    expect(screen.getByRole('region', { name: /conversation ideas/i })).toBeInTheDocument();
  });
});
