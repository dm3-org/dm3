interface SignInHelpProps {
    setToken: (token: string) => void;
    token: string | undefined;
}

function TokenInput(props: SignInHelpProps) {
    return (
        <input
            onInput={(e) => props.setToken((e.target as any).value)}
            type="text"
            className="form-control row-space"
            id="exampleInputEmail1"
            placeholder="API Token"
        />
    );
}

export default TokenInput;
