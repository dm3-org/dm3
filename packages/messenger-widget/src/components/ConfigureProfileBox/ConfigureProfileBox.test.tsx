import { fireEvent, render } from '@testing-library/react';
import ConfigureProfileBox from './ConfigureProfileBox';
import '@testing-library/jest-dom';

describe('ConfigureProfileBox test cases', () => {
    it('Renders ConfigureProfileBox component', () => {
        const { getByTestId } = render(<ConfigureProfileBox />);
        const configBoxElement = getByTestId('config-profile-box');
        expect(configBoxElement).toBeInTheDocument();
    });

    it('Click on open configure profile button', () => {
        const { getByTestId } = render(<ConfigureProfileBox />);
        const btn = getByTestId('config-prof-btn');
        const action = fireEvent.click(btn);
        expect(action).toBe(true);
    });
});
