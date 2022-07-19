export function log(text: string) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(text);
    }
}
