import { render } from '@testing-library/react';
import { Preferences } from './Preferences';
import '@testing-library/jest-dom';

describe('Preferences test cases', () => {
    it('Renders Preferences component', () => {
        const { container } = render(<Preferences />);
        const element = container.getElementsByClassName(
            'preferences-modal-content',
        );
        expect(element[0]).toBeInTheDocument();
    });
});
