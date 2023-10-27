import { fireEvent, render } from '@testing-library/react';
import { SignIn } from './SignIn';
import '@testing-library/jest-dom';

describe('SignIn test cases', () => {
    const props = {
        hideStorageSelection: true,
        miniSignIn: false,
        defaultStorageLocation: undefined,
    };

    it('Renders SignIn component', () => {
        const { getByRole } = render(<SignIn {...props} />);
        const element = getByRole('div');
        expect(element).toBeInTheDocument();
    });

    it('Renders sign in component image', () => {
        const { container } = render(<SignIn {...props} />);
        const element = container.getElementsByClassName('home-image');
        expect(element[0]).toBeInTheDocument();
    });

    it('Renders DM3 image', () => {
        const { container } = render(<SignIn {...props} />);
        const element = container.getElementsByClassName('sign-in-logo');
        expect(element[0]).toBeInTheDocument();
    });

    it('Should fetch we3 messaging content', () => {
        const { getByText } = render(<SignIn {...props} />);
        const element = getByText('web3 messaging.');
        expect(element).toBeInTheDocument();
    });

    it('Should fetch we3 messaging content', () => {
        const { getByText } = render(<SignIn {...props} />);
        const element = getByText('web3 messaging.');
        expect(element).toBeInTheDocument();
    });

    it('Should fetch we3 messaging service content', () => {
        const { getByText } = render(<SignIn {...props} />);
        const element = getByText(
            'encrypted. private. decentralized. interoperable.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Should fetch connect content', () => {
        const content =
            'Connect the dm3 messenger with your wallet and' +
            ' sign in with a signature. No need for a username or password.';
        const { getByText } = render(<SignIn {...props} />);
        const element = getByText(content);
        expect(element).toBeInTheDocument();
    });

    it('Should fetch privacy content', () => {
        const content =
            'Keys for secure and private communication are' +
            ' derived from this signature.';
        const { getByText } = render(<SignIn {...props} />);
        const element = getByText(content);
        expect(element).toBeInTheDocument();
    });

    it('Should fetch no paid transaction content', () => {
        const content = 'No paid transaction will be executed.';
        const { getByText } = render(<SignIn {...props} />);
        const element = getByText(content);
        expect(element).toBeInTheDocument();
    });

    it('Click on Sign In button', () => {
        const { getByRole } = render(<SignIn {...props} />);
        const button = getByRole('button');
        const action = fireEvent.click(button);
        expect(action).toBe(true);
    });
});
