import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { EnsDetails } from './EnsDetails';

describe('EnsDetails test cases', () => {
    const props = {
        propertyKey: 'name',
        propertyValue: 'user',
    };

    it('Renders EnsDetails component', () => {
        const { getByTestId } = render(<EnsDetails {...props} />);
        const data = getByTestId('ens-details');
        expect(data).toBeInTheDocument();
    });

    it('Renders EnsDetails key', () => {
        const { getByTestId } = render(<EnsDetails {...props} />);
        const data = getByTestId('ens-details-key');
        expect(data).toBeInTheDocument();
    });

    it('Renders EnsDetails value', () => {
        const { getByTestId } = render(<EnsDetails {...props} />);
        const data = getByTestId('ens-details-value');
        expect(data).toBeInTheDocument();
    });
});
