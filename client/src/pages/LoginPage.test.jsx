import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('shows a useful validation message when fields are empty', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /join room/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter both a username and room name.');
  });
});
