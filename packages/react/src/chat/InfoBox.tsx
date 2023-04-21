
interface InfoBoxProps {
    text: string;
}

function InfoBox(props: InfoBoxProps) {
    return (
        <div
            className="alert alert-warning profile-warning w-100 info-box text-center"
            role="alert"
        >
            {props.text}
        </div>
    );
}

export default InfoBox;
