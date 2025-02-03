import Link from "next/link";

export default function NotFound() {
    return (
        <div className="container mx-auto px-4" >
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6" >
                <h1 className="text-4xl font-bold mb-2" > 404 - Page Not Found </h1>
                <p className="text-gray-600 text-lg mb-3">
                    The page you&apos;ve navigated to doesn&apos;t exist. Awkward.
                </p>
                <Link
                    href="/"
                    className="text-[18px]"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    )
}
