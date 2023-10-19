import { fireEvent, render } from '@testing-library/react';
import { ContactMenu } from './ContactMenu';
import '@testing-library/jest-dom';

describe('ContactMenu test cases', () => {
    const props = {
        contactDetails: {
            name: 'test',
            message: 'test',
            image: 'image',
            contactDetails: {} as any,
        },
        index: 1,
        isMenuAlignedAtBottom: true,
    };

    it('Renders ContactMenu component', () => {
        const { container } = render(<ContactMenu {...props} />);
        const element = container.getElementsByClassName('dropdown-content');
        expect(element[0]).toBeInTheDocument();
    });

    it('Renders show details button', () => {
        const { getByText } = render(<ContactMenu {...props} />);
        const element = getByText('Show Details');
        expect(element).toBeInTheDocument();
    });

    it('Renders hide contact button', () => {
        const { getByText } = render(<ContactMenu {...props} />);
        const element = getByText('Hide Contact');
        expect(element).toBeInTheDocument();
    });

    it('Click on show details button', () => {
        const { getByText } = render(<ContactMenu {...props} />);
        const element = getByText('Show Details');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Click on hide contact button', () => {
        const { getByText } = render(<ContactMenu {...props} />);
        const element = getByText('Hide Contact');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
