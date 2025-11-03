import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { profileString } from '~/constants';
import { UserProfile } from '~/routes';
import { render } from '~/utilities/testing';

describe('Profile Card tests', () => {
  const router = createMemoryRouter([
    {
      element: <UserProfile />,
      path: '/',
    },
  ]);
  it('displays all elements', () => {
    localStorage.setItem('fullName', 'Test User');
    localStorage.setItem('email', 'testUser@gmail.com');
    render(<RouterProvider router={router} />);
    const name_field = screen.getByTestId('name-text');
    const email_field = screen.getByTestId('email-text');
    const bio_field = screen.getByTestId('bio-text');
    const edit_btn = screen.getByTestId('edit-btn');
    const share_btn = screen.getByTestId('share-btn');
    expect(name_field).toHaveTextContent(`${localStorage.getItem('fullName')}`);
    expect(email_field).toHaveTextContent(`${localStorage.getItem('email')}`);
    expect(bio_field).toHaveTextContent(`${profileString.default}`);
    expect(edit_btn).toHaveTextContent('Edit');
    expect(share_btn).toHaveTextContent('Share');
  });
});
