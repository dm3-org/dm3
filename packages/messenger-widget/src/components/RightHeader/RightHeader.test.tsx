import { act, fireEvent, render } from '@testing-library/react';
import { NormalView } from './NormalView';
import '@testing-library/jest-dom';

describe('RightHeader test cases', () => {
    it('Renders RightHeader component', async () => {
        const { container } = await act(async () => render(<NormalView />));
        const element = container.querySelector('div');
        expect(element).toBeInTheDocument();
    });

    it('Should render user address', async () => {
        const { container } = await act(async () => render(<NormalView />));
        const element = container.querySelector('span');
        expect(element).toBeInTheDocument();
    });

    it('Should render profile picture', async () => {
        const { getByRole } = await act(async () => render(<NormalView />));
        const element = getByRole('img');
        expect(element).toBeInTheDocument();
    });

    it('Click on user address to open profile details', async () => {
        const { getByTestId } = await act(async () => render(<NormalView />));
        const element = getByTestId('display-name-id');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Click on profile pic to open profile details', async () => {
        const { getByRole } = await act(async () => render(<NormalView />));
        const element = getByRole('img');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
