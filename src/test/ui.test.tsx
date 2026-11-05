import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import { TraceViewer } from '../components/TraceViewer';
import { pointers } from '../content/pointers';
import { STORAGE_KEY } from '../lib/progress';

describe('TraceViewer', () => {
  const trace = pointers.nodes.find((n) => n.id === 'amp-star')!.trace;

  it('moves the highlighted line and the memory with Next / Back and arrow keys', () => {
    render(<TraceViewer trace={trace} />);
    const current = () => document.querySelector('.code-line.current .ln')?.textContent;
    expect(current()).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(current()).toBe('3');
    // After line 3, p's cell points at x's address.
    expect(document.querySelector('[data-points="0x100"]')).not.toBeNull();
    fireEvent.keyDown(screen.getByLabelText(/step-by-step/i), { key: 'ArrowLeft' });
    expect(current()).toBe('2');
    expect(document.querySelector('[data-points]')).toBeNull();
  });

  it('disables Back on the first step and Next on the last', () => {
    render(<TraceViewer trace={trace} />);
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    for (let i = 0; i < trace.steps.length; i++) fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByText('20', { selector: '.output code' })).toBeInTheDocument();
  });
});

describe('App', () => {
  it('answering every question in a topic turns it green and saves progress', () => {
    window.location.hash = '#/pointers/addresses';
    render(<App />);
    const panel = screen.getByRole('complementary', { name: /every variable lives at an address/i });

    // Q1 (choice) and Q3 (choice): pick the right option and check.
    const cards = panel.querySelectorAll('.question');
    fireEvent.click(within(cards[0] as HTMLElement).getByLabelText(/different addresses/i));
    fireEvent.click(within(cards[0] as HTMLElement).getByRole('button', { name: 'Check' }));
    expect(within(cards[0] as HTMLElement).getByRole('status')).toHaveTextContent('Correct');

    const mapNode = () => screen.getByRole('button', { name: /every variable lives at an address, /i });
    expect(mapNode()).toHaveAccessibleName(/in progress, 1 of 3/);

    // Q2 (output): a wrong answer first, then the right one.
    const input = within(cards[1] as HTMLElement).getByRole('textbox');
    fireEvent.change(input, { target: { value: '3 4' } });
    fireEvent.click(within(cards[1] as HTMLElement).getByRole('button', { name: 'Check' }));
    expect(within(cards[1] as HTMLElement).getByRole('status')).toHaveTextContent('Not quite');
    fireEvent.change(input, { target: { value: '4 3' } });
    fireEvent.click(within(cards[1] as HTMLElement).getByRole('button', { name: 'Check' }));

    fireEvent.click(within(cards[2] as HTMLElement).getByLabelText(/where a box is/i));
    fireEvent.click(within(cards[2] as HTMLElement).getByRole('button', { name: 'Check' }));

    expect(mapNode()).toHaveAccessibleName(/mastered, 3 of 3/);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      'addresses-1': true, 'addresses-2': true, 'addresses-3': true,
    });
  });

  it('loads saved progress and ignores corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, '{oops');
    window.location.hash = '#/';
    render(<App />);
    expect(screen.getByRole('progressbar', { name: 'Your progress' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('Escape closes the topic panel', () => {
    window.location.hash = '#/pointers/heap';
    render(<App />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    act(() => { fireEvent.keyDown(window, { key: 'Escape' }); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});
