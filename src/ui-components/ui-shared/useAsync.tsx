import { useEffect } from 'react';

export function useAsync(
    asyncFn: () => Promise<unknown>,
    onSuccess: (data: unknown) => void,
    deps?: React.DependencyList | undefined,
) {
    useEffect(() => {
        let isActive = true;
        asyncFn().then((data) => {
            if (isActive) onSuccess(data);
        });
        return () => {
            isActive = false;
        };
    }, deps);
}
