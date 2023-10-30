import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loader } from './Loader';

describe('Loader test cases', () => {
    it('Renders Loader component', () => {
        const { container } = render(<Loader />);
        const element = container.getElementsByClassName('loading');
        expect(element[0]).toBeInTheDocument();
    });

    it('Renders loader image', () => {
        const { container } = render(<Loader />);
        const element = container.getElementsByClassName('loader-img');
        expect(element[0]).toBeInTheDocument();
    });
});
