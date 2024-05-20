import { render } from '@testing-library/react';
import { MessageInputBox } from './MessageInputBox';
import '@testing-library/jest-dom';

describe('MessageInputBox test cases', () => {
    it('Renders MessageInputBox component', () => {
        const { getByTestId } = render(<MessageInputBox />);
        const element = getByTestId('msg-input-box-container');
        expect(element).toBeInTheDocument();
    });
});
