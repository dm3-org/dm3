interface Props {
    identifier: string;
}

function Avatar(props: Props) {
    const { identifier } = props;

    return (
        <div className="avatar">
            <img
                loading="lazy"
                width="38px"
                height="38px"
                src={`https://robohash.org/${identifier}?size=38x38`}
                alt={`cute robot avatar of dm3 user: ${identifier}`}
            />
        </div>
    );
}

export default Avatar;
