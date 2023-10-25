import { fireEvent, render } from '@testing-library/react';
import { Profile } from './Profile';
import '@testing-library/jest-dom';

describe('Profile test cases', () => {
    it('Renders Profile component', () => {
        const { container } = render(<Profile />);
        expect(container).toBeInTheDocument();
    });

    it('Fetch profile heading', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Profile');
        expect(element).toBeInTheDocument();
    });

    it('Click on close profile button', () => {
        const { container } = render(<Profile />);
        const element = container.getElementsByClassName('close-icon');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });

    it('Should render the profile picture', () => {
        const { container } = render(<Profile />);
        const element = container.getElementsByClassName('profile-image');
        expect(element[0]).toBeInTheDocument();
    });

    it('Should render the name', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Name');
        expect(element).toBeInTheDocument();
    });

    it('Should render the address', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Address');
        expect(element).toBeInTheDocument();
    });

    it('Should render the E-Mail', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('E-Mail');
        expect(element).toBeInTheDocument();
    });

    it('Should render the Github', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Github');
        expect(element).toBeInTheDocument();
    });

    it('Should render the Twitter', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Twitter');
        expect(element).toBeInTheDocument();
    });

    it('Click on the open ENS profile button', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Open ENS profile');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Click on the configure dm3 profile button', () => {
        const { getByText } = render(<Profile />);
        const element = getByText('Configure dm3 profile');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
