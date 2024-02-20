import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DM3 Next App',
    description: 'Decentralized messaging',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
