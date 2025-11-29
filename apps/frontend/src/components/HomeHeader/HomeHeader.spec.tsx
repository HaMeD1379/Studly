import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BADGES,
  HOME_START_STUDY_SESSION_TEXT,
  HOME_VIEW_BADGES,
  HOME_VIEW_MORE_BADGES,
  HOME_WELCOME_MESSAGE,
  STUDY,
} from '~/constants';
import { render } from '~/utilities/testing';
import { HomeHeader } from './HomeHeader';

const mockNavigate = vi.fn();
const mockSetGlobalPath = vi.fn();
const mockSetName = vi.fn();
const mockSetBio = vi.fn();
const mockAction = vi.fn();

const mockLoaderData = {
  data: {
    inProgressBadges: [
      { description: 'Study 10 hours', name: 'Marathon', progress: 70 },
      { description: 'Study 3 days straight', name: 'Sprinter', progress: 40 },
    ],
    todaySession: {
      totalMinutesStudied: 120,
    },
    unlockedBadges: [{ name: 'First Steps' }, { name: 'Consistency' }],
    userProfileInfo: {
      data: {
        bio: 'Keep pushing forward!',
        full_name: 'Alice',
      },
    },
  },
};

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    __esModule: true,
    ...actual,
    useLoaderData: () => mockLoaderData,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('~/context', () => ({
  useNavbar: () => ({
    setGlobalPath: mockSetGlobalPath,
  }),
}));

vi.mock('~/store', () => ({
  userInfo: vi.fn(() => ({
    setBio: mockSetBio,
    setName: mockSetName,
  })),
}));

describe('HomeHeader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user name and welcome message', () => {
    render(<HomeHeader action={mockAction} />);

    expect(
      screen.getByText(`${HOME_WELCOME_MESSAGE} Alice! 👋`),
    ).toBeInTheDocument();
  });

  it('renders progress and badges information', () => {
    render(<HomeHeader action={mockAction} />);

    expect(screen.getByText(/2 hours 0 minutes today/i)).toBeInTheDocument();
    expect(screen.getByText(/2 badges/i)).toBeInTheDocument();
    expect(screen.getByText('Marathon')).toBeInTheDocument();
  });

  it("calls action when 'View More Badges' button is clicked", () => {
    render(<HomeHeader action={mockAction} />);

    const btn = screen.getByRole('button', { name: HOME_VIEW_MORE_BADGES });
    fireEvent.click(btn);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('navigates and updates context when quick action buttons are clicked', () => {
    render(<HomeHeader action={mockAction} />);

    const studyButton = screen.getByRole('button', {
      name: HOME_START_STUDY_SESSION_TEXT,
    });
    const badgesButton = screen.getByRole('button', {
      name: HOME_VIEW_BADGES,
    });

    fireEvent.click(studyButton);
    expect(mockSetGlobalPath).toHaveBeenCalledWith(STUDY);
    expect(mockNavigate).toHaveBeenCalledWith(STUDY);

    fireEvent.click(badgesButton);
    expect(mockSetGlobalPath).toHaveBeenCalledWith(BADGES);
    expect(mockNavigate).toHaveBeenCalledWith(BADGES);
  });

  it('updates userInfo store on mount', () => {
    render(<HomeHeader action={mockAction} />);

    expect(mockSetName).toHaveBeenCalledWith('Alice');
    expect(mockSetBio).toHaveBeenCalledWith('Keep pushing forward!');
  });
});
