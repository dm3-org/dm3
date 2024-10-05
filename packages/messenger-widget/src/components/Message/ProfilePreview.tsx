import './Message.css';

export interface ProfilePreviewProps {
    picture: string;
    name: string;
}

export function ProfilePreview(props: ProfilePreviewProps) {
    return (
        <div className="d-flex align-items-center">
            <img
                className="chat-profile-pic mb-1 pointer-cursor"
                src={props.picture}
            />
            <div className="ms-2 font-size-12 font-weight-800 pointer-cursor">
                {props.name.length > 16 ? props.name.slice(0, 16) : props.name}
            </div>
        </div>
    );
}
