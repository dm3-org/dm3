import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ImageViewModal } from './ImageViewModal';

describe('ImageViewModal test cases', () => {
    const props = {
        uri:
            'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
            'the-essential-guide-to-using-images-legally-online.png',
        setUri: () => {},
    };

    it('Renders ImageViewModal component', () => {
        const { getByTestId } = render(<ImageViewModal {...props} />);
        const modal = getByTestId('image-view-modal');
        expect(modal).toBeInTheDocument();
    });

    it('Renders image passed in props', () => {
        const { getByTestId } = render(<ImageViewModal {...props} />);
        const image = getByTestId('image-modal');
        expect(image).toBeInTheDocument();
    });

    it('Close the image view', () => {
        const mockFn = jest.fn();
        props.setUri = mockFn;
        const { getByTestId } = render(<ImageViewModal {...props} />);
        const close = getByTestId('close-img');
        fireEvent.click(close);
        expect(mockFn).toBeCalledTimes(1);
    });
});
