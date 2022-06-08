import React from 'react';

interface InfoBoxProps {
    text: string;
}

function InfoBox(props: InfoBoxProps) {
    return (
        <div className="alert alert-warning w-100 info-box" role="alert">
            {props.text}
        </div>
    );
}

export default InfoBox;
