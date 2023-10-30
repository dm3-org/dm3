import { fireEvent, render } from '@testing-library/react';
import { ConfigureProfile } from './ConfigureProfile';
import '@testing-library/jest-dom';

describe('ConfigureProfile test cases', () => {
    it('Renders ConfigureProfile component', () => {
        const { container } = render(<ConfigureProfile />);
        const element = container.getElementsByClassName(
            'configuration-modal-content',
        );
        expect(element[0]).toBeInTheDocument();
    });

    it('Renders DM3 profile heading content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText('DM3 Profile Configuration');
        expect(element).toBeInTheDocument();
    });

    it('Renders DM3 profile description content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText(
            'Your dm3 profile needs to be published. You can' +
                ' use your own ENS name, get a DM3 name, or keep your wallet address.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Click on close DM3 profile configuration model', () => {
        const { container } = render(<ConfigureProfile />);
        const element = container.getElementsByClassName('close-modal-icon');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });

    it('Renders Wallet Address heading content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText('Wallet Address');
        expect(element).toBeInTheDocument();
    });

    it('Renders Wallet Address description 1 content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText(
            'You can use your wallet address as a username. A virtual' +
                ' profile is created and stored at a dm3 service. There are no transaction costs for' +
                ' creation and administration.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Renders Wallet Address description 2 content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText(
            'You can receive messages sent to your wallet address.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Renders DM3 name heading content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText('DM3 Name');
        expect(element).toBeInTheDocument();
    });

    it('Should handle change in input field of DM3 name', () => {
        const { getByTestId } = render(<ConfigureProfile />);
        const element = getByTestId('dm3-name');
        const action = fireEvent.change(element, {
            target: { value: 'new-user' },
        });
        expect(action).toBe(true);
    });

    it('Click on Claim & Publish button to configure DM3 name', () => {
        const { getByTestId } = render(<ConfigureProfile />);
        const button = getByTestId('claim-publish');
        const action = fireEvent.click(button);
        expect(action).toBe(true);
    });

    it('Renders ENS name heading content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText('ENS Name');
        expect(element).toBeInTheDocument();
    });

    it('Renders ENS name description 1 content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText(
            'To publish your dm3 profile, a transaction is sent to set' +
                ' a text record in your ENS name. Transaction costs will apply for setting the profile' +
                ' and administration.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Renders ENS name description 2 content', () => {
        const { getByText } = render(<ConfigureProfile />);
        const element = getByText(
            'You can receive dm3 messages directly sent to your ENS name.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Should handle change in input field of ENS name', () => {
        const { getByTestId } = render(<ConfigureProfile />);
        const element = getByTestId('ens-name');
        const action = fireEvent.change(element, { target: { value: 'user' } });
        expect(action).toBe(true);
    });

    it('Click on Publish Profile button to configure ENS name', () => {
        const { getByTestId } = render(<ConfigureProfile />);
        const button = getByTestId('publish-profile');
        const action = fireEvent.click(button);
        expect(action).toBe(true);
    });
});
