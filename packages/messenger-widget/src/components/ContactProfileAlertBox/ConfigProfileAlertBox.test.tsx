import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ContactProfileAlertBox from './ContactProfileAlertBox';

describe('ContactProfileAlertBox test cases', () => {
    it('Renders ContactProfileAlertBox component', () => {
        const { getByTestId } = render(<ContactProfileAlertBox />);
        const data = getByTestId('configure-profile-alert-box');
        expect(data).toBeInTheDocument();
    });

    it('Renders alert message heading', () => {
        const { getByTestId } = render(<ContactProfileAlertBox />);
        const data = getByTestId('alert-heading');
        expect(data).toHaveTextContent(
            'This contact hasn’t published the dm3 profile yet.',
        );
    });

    it('Renders alert message description', () => {
        const { getByTestId } = render(<ContactProfileAlertBox />);
        const data = getByTestId('alert-description');
        expect(data).toHaveTextContent(
            'You can already write messages. But these will not be sent until' +
                ' the recipient has published the dm3 profile. Until then they are' +
                ' saved in your storage.',
        );
    });
});
