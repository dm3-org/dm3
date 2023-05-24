import { createElement } from 'react';

interface Props {
    imgSrc: string;
    slogan: string;
    url?: string;
}

function Branding(props: Props) {
    const { imgSrc, slogan, url } = props;
    const tag = url ? 'a' : 'div';

    return createElement(
        tag,
        { className: 'branding' },
        <div className="branding-items">
            <span className="branding-slogan text-tiny">{slogan}</span>
            <img className="branding-logo" src={imgSrc} alt="" />
        </div>,
    );
}

export default Branding;
