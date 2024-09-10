import { act, fireEvent, render } from '@testing-library/react';
import { Profile } from './Profile';
import '@testing-library/jest-dom';

describe('Profile test cases', () => {
    it('Renders Profile component', async () => {
        const { container } = await act(async () => render(<Profile />));
        expect(container).toBeInTheDocument();
    });

    it('Fetch profile heading', async () => {
        const { getByText } = await act(async () => render(<Profile />));
        const element = getByText('Profile');
        expect(element).toBeInTheDocument();
    });

    it('Click on close profile button', async () => {
        const { container } = await act(async () => render(<Profile />));
        const element = container.getElementsByClassName('close-icon');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });

    it('Should render the profile picture', async () => {
        const { container } = await act(async () => render(<Profile />));
        const element = container.getElementsByClassName('profile-image');
        expect(element[0]).toBeInTheDocument();
    });

    it('Click on the open ENS profile button', async () => {
        window.open = jest.fn();
        const { getByText } = await act(async () => render(<Profile />));
        const element = getByText('Open ENS profile');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Click on the configure dm3 profile button', async () => {
        const { getByText } = await act(async () => render(<Profile />));
        const element = getByText('Configure dm3 profile');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
