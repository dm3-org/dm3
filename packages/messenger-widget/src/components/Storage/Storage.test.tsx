import { render } from '@testing-library/react';
import Storage from './Storage';
import '@testing-library/jest-dom';

describe('Storage test cases', () => {
    it('Renders Storage component', () => {
        const { container } = render(<Storage />);
        expect(container).toBeInTheDocument();
    });
});
