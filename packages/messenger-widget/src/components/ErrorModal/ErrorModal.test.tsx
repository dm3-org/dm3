import ErrorModal from './ErrorModal';
import '@testing-library/jest-dom';
import { openErrorModal } from '../../utils/common-utils';
import { fireEvent, render } from '@testing-library/react';

describe('ErrorModal test cases', () => {
    it('Renders ErrorModal component', () => {
        const { getByTestId } = render(<ErrorModal />);
        const modal = getByTestId('error-modal');
        expect(modal).toBeInTheDocument();
    });

    it('Check error content', () => {
        const mockFn = jest.fn();
        const { getByTestId } = render(<ErrorModal />);
        openErrorModal('There is some error', false, mockFn);
        const modal = getByTestId('error-message');
        expect(modal.innerText).toBe('There is some error');
    });

    it('Renders OK button', () => {
        const mockFn = jest.fn();
        const { getByTestId } = render(<ErrorModal />);
        openErrorModal('There is some error', false, mockFn);
        const button = getByTestId('ok-btn');
        expect(button).toHaveTextContent('OK');
    });

    it('Click on OK button', () => {
        const mockFn = jest.fn();
        const { getByTestId } = render(<ErrorModal />);
        openErrorModal('There is some error', false, mockFn);
        const button = getByTestId('ok-btn');
        const action = fireEvent.click(button);
        expect(action).toBe(true);
    });
});
