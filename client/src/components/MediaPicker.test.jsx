import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MediaPicker from './MediaPicker';

describe('MediaPicker', () => {
  it('inserts emojis and previews a sticker before sending it', async () => {
    const user = userEvent.setup();
    const onEmoji = vi.fn();
    const onMedia = vi.fn();
    render(<MediaPicker onEmoji={onEmoji} onMedia={onMedia} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '😀' }));
    expect(onEmoji).toHaveBeenCalledWith('😀');

    await user.click(screen.getByRole('tab', { name: /stickers/i }));
    await user.click(screen.getByRole('button', { name: /party mode/i }));
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onMedia).toHaveBeenCalledWith({ type: 'sticker', assetId: 'party_blob' });
  });
});
