import { fireEvent, render } from '@testing-library/react';
import AddConversation from './AddConversation';
import '@testing-library/jest-dom';

describe('AddConversation test cases', () => {
    it('Renders AddConversation component', () => {
        const { container } = render(<AddConversation />);
        const element = container.getElementsByClassName(
            'conversation-modal-content',
        );
        expect(element[0]).toBeInTheDocument();
    });

    it('Fetch Add Conversation heading', () => {
        const { getByText } = render(<AddConversation />);
        const element = getByText('Add Conversation');
        expect(element).toBeInTheDocument();
    });

    it('Fetch Add Conversation short description', () => {
        const { getByText } = render(<AddConversation />);
        const element = getByText(
            'Add or reactivate a conversation with a web3 name.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Click on close Add Conversation modal', () => {
        const { getByRole } = render(<AddConversation />);
        const element = getByRole('img');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Render form in Add Conversation modal', () => {
        const { getByRole } = render(<AddConversation />);
        const element = getByRole('form');
        expect(element).toBeInTheDocument();
    });

    it('Renders Add Conversation detailed description', () => {
        const { container } = render(<AddConversation />);
        const element = container.getElementsByClassName(
            'conversation-description',
        );
        expect(element[0]).toBeInTheDocument();
    });

    it('Fetch Add Conversation name label', () => {
        const { getByRole } = render(<AddConversation />);
        const element = getByRole('label');
        expect(element).toBeInTheDocument();
    });

    it('Must handle change in input field', () => {
        const { getByRole } = render(<AddConversation />);
        const element = getByRole('input');
        const action = fireEvent.change(element, {
            target: { value: 'new.user' },
        });
        expect(action).toBe(true);
    });

    it('Click on Add button', () => {
        const { getByRole } = render(<AddConversation />);
        const element = getByRole('button');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
