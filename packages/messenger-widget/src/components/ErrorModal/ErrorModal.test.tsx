import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ErrorModal from './ErrorModal';

describe('ErrorModal test cases', () => {
    it('Renders ErrorModal component', () => {
        const { getByTestId } = render(<ErrorModal />);
        const modal = getByTestId('error-modal');
        expect(modal).toBeInTheDocument();
    });
});
