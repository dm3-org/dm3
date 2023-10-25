import { fireEvent, render } from '@testing-library/react';
import Menu from './Menu';
import '@testing-library/jest-dom';

describe('Menu test cases', () => {
    it('Renders Menu component', () => {
        const { container } = render(<Menu />);
        const element = container.getElementsByClassName('menu-container');
        expect(element[0]).toBeInTheDocument();
    });

    it('Click on close icon to close menu modal', () => {
        const { container } = render(<Menu />);
        const element = container.getElementsByClassName('close-icon');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });

    it('Fetch add conversation menu from modal', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('Add Conversation');
        expect(element).toBeInTheDocument();
    });

    it('Fetch preferences menu from modal', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('Preferences');
        expect(element).toBeInTheDocument();
    });

    it('Click on add conversation menu from list', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('Add Conversation');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Click on preferences menu from list', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('Preferences');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });

    it('Fetch DM3 footer content from modal', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('dm3');
        expect(element).toBeInTheDocument();
    });

    it('Fetch DM3 version footer content from modal', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('Version 1.1');
        expect(element).toBeInTheDocument();
    });

    it('Fetch DM3 network footer content from modal', () => {
        const { getByText } = render(<Menu />);
        const element = getByText('https://dm3.network');
        expect(element).toBeInTheDocument();
    });
});
