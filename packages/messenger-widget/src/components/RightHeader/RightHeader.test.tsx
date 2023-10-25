import { fireEvent, render } from '@testing-library/react';
import { RightHeader } from './RightHeader';
import '@testing-library/jest-dom';

describe('RightHeader test cases', () => {
    it('Renders RightHeader component', () => {
        const { getByRole } = render(<RightHeader />);
        const element = getByRole('div');
        expect(element).toBeInTheDocument();
    });

    it('Should render user address', () => {
        const { getByRole } = render(<RightHeader />);
        const element = getByRole('span');
        expect(element).toBeInTheDocument();
    });

    it('Should render profile picture', () => {
        const { getByRole } = render(<RightHeader />);
        const element = getByRole('img');
        expect(element).toBeInTheDocument();
    });

    it('Click on user address to open profile details', () => {
        const { getByRole } = render(<RightHeader />);
        const element = getByRole('span');
        const action = fireEvent.click(element);
        expect(action).toBeInTheDocument();
    });

    it('Click on profile pic to open profile details', () => {
        const { getByRole } = render(<RightHeader />);
        const element = getByRole('img');
        const action = fireEvent.click(element);
        expect(action).toBeInTheDocument();
    });
});
