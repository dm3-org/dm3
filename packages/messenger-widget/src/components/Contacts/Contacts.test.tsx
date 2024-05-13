import { screen, render } from '@testing-library/react';
import { Contacts } from './Contacts';
import '@testing-library/jest-dom';

describe('Contacts test cases', () => {
    it('Renders Contacts component', () => {
        render(<Contacts />);
        expect(screen.getByText('Contact Info')).toBeInTheDocument();
    });
});
