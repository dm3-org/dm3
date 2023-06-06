import React from 'react';

const ProgressProvider = ({ valueStart, valueEnd, children }: any) => {
    const [value, setValue] = React.useState(valueStart);
    React.useEffect(() => {
        setValue(valueEnd);
    }, [valueEnd]);

    return children(value);
};
export default ProgressProvider;
