export function withAuthHeader(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}
