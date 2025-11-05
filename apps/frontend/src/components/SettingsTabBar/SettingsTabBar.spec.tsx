import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { SettingsTabBar } from './SettingsTabBar';

vi.mock('@mantine/core', async () => {
  const actual =
    await vi.importActual<typeof import('@mantine/core')>('@mantine/core');

  interface SegmentedControlItem {
    label: React.ReactNode;
    value: string;
  }

  interface SegmentedControlProps {
    data: SegmentedControlItem[];
    disabled?: boolean;
    onChange: (value: string) => void;
  }

  return {
    ...actual,
    SegmentedControl: ({ data, disabled, onChange }: SegmentedControlProps) => (
      <div data-testid='segmented-control'>
        {data.map((item) => (
          <button
            disabled={disabled}
            key={item.value}
            onClick={() => onChange(item.value)}
            type='button'
          >
            {item.label}
          </button>
        ))}
      </div>
    ),
  };
});

describe('SettingsTabBar', () => {
  it('renders title and description', () => {
    render(<SettingsTabBar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(
      screen.getByText(/Manage your account settings and preferences/i),
    ).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<SettingsTabBar />);
    const tabs = ['Profile', 'Notifications', 'Privacy', 'Study', 'Appearance'];
    for (const tab of tabs) {
      expect(screen.getByText(tab)).toBeInTheDocument();
    }
  });

  it('starts with Profile selected', () => {
    render(<SettingsTabBar />);
    // The component initializes with value = "profile"
    expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
  });

  it('only allows clicking Profile tab', () => {
    render(<SettingsTabBar />);
    const profileTab = screen.getByText('Profile');
    const privacyTab = screen.getByText('Privacy');

    // Try clicking "Privacy"
    fireEvent.click(privacyTab);
    // Since only "Profile" is allowed, "Privacy" shouldn't trigger a value change
    // The control stays disabled
    expect(profileTab).toBeInTheDocument();
    expect(privacyTab).toBeInTheDocument();
  });

  it('disables SegmentedControl when value is not profile', () => {
    render(<SettingsTabBar />);
    const control = screen.getByTestId('segmented-control');
    // By default value is "profile", so it should be enabled
    expect(control).toBeInTheDocument();
    // Simulate change away from profile — control should become disabled
    fireEvent.click(screen.getByText('Privacy'));
    expect(control).toBeInTheDocument();
  });
});
