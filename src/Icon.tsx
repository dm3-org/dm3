import '@fortawesome/fontawesome-free/css/all.min.css';

interface GraphProps {
    iconClass: string;
}

function Icon(props: GraphProps) {
    return <i className={props.iconClass}></i>;
}

export default Icon;
