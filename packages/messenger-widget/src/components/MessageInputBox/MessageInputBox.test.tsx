import { render } from '@testing-library/react';
import { MessageInputBox } from './MessageInputBox';
import '@testing-library/jest-dom';

describe('MessageInputBox test cases', () => {
    it('Renders MessageInputBox component', () => {
        const { getByRole } = render(<MessageInputBox />);
        const element = getByRole('div');
        expect(element).toBeInTheDocument();
    });
});
