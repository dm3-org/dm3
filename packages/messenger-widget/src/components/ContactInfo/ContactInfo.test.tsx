import { fireEvent, screen, render } from '@testing-library/react';
import { ContactInfo } from './ContactInfo';
import '@testing-library/jest-dom';

describe('ContactInfo test cases', () => {
    it('Renders ContactInfo component', () => {
        render(<ContactInfo />);
        expect(screen.getByText('Contact Info')).toBeInTheDocument();
    });

    it('Check profile picture', () => {
        const { container } = render(<ContactInfo />);
        const element = container.getElementsByClassName('profile-image');
        expect(element[0]).toBeInTheDocument();
    });

    it('Close the screen by click on button', () => {
        const { container } = render(<ContactInfo />);
        const element = container.getElementsByClassName('close-icon');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });

    it('Click open ENS profile', () => {
        const { getByRole } = render(<ContactInfo />);
        const button = getByRole('Open ENS profile');
        const action = fireEvent.click(button);
        expect(action).toBe(true);
    });

    it('Click hide contact', () => {
        const { getByRole } = render(<ContactInfo />);
        const button = getByRole('Hide Contact');
        const action = fireEvent.click(button);
        expect(action).toBe(true);
    });
});
