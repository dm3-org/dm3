import { fireEvent, render } from '@testing-library/react';
import { IContactMenu } from '../../interfaces/props';
import { ContactMenu } from './ContactMenu';
import '@testing-library/jest-dom';

describe('ContactMenu test cases', () => {
    const props: IContactMenu = {
        contactDetails: {
            name: 'test',
            contactTldNames: [],
            message: 'test',
            image: 'image',
            contactDetails: {
                account: {
                    ensName: '',
                },
            } as any,
            isHidden: false,
            messageSizeLimit: 100000,
            updatedAt: 0,
        },
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
