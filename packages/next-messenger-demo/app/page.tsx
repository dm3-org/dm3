'use client';

import dynamic from 'next/dynamic';
const DM3Container = dynamic(() => import('./components/DM3Container'), {
    ssr: false,
});

export default function Home() {
    return (
        <main>
            <DM3Container />
        </main>
    );
}
