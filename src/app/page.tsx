import Link from 'next/link'

export default function Home() {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Institute for Artificial Thought</h1>

            <nav className="flex flex-col space-y-4">
                <Link
                    href="/topics"
                    className="text-lg hover:underline"
                >
                    Topics
                </Link>
                <Link
                    href="/essays"
                    className="text-lg hover:underline"
                >
                    Essays
                </Link>
                <Link
                    href="/authors"
                    className="text-lg hover:underline"
                >
                    Authors
                </Link>
            </nav>
        </div>
    )
}