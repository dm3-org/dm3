export function log(text: string) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(text);
    }
}
