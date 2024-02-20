import './Preferences.css';

export interface IHeading {
    heading: string;
    description: string;
}

export function Heading(props: IHeading) {
    return (
        <div className="background-container preferences-content">
            <h4 className="mb-0 font-weight-800">{props.heading}</h4>
            <span className="font-weight-500 font-size-12">
                {props.description}
            </span>
        </div>
    );
}
