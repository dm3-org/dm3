import dm3Logo from '../assets/dm3-logo-huge.png';

interface Props {
    info: string;
    imgSrc?: string;
}

function EmptyView(props: Props) {
    const { info, imgSrc = dm3Logo } = props;

    return (
        <div className="empty-view">
            <div>
                <img className="empty-image" src={imgSrc} alt="Logo" />
                <div className="empty-info text-sm">{info}</div>
            </div>
        </div>
    );
}

export default EmptyView;
