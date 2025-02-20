import Link from 'next/link'
import EssayIcon from '@/components/icons/EssayIcon'
import PlayIcon from '@/components/icons/PlayIcon'
import PenIcon from '@/components/icons/PenIcon'
export default function TestDashboard() {
    const testLinks = [
        {
            href: '/admin/test/ui',
            title: 'UI Components Test',
            description: 'View and verify all UI elements',
            Icon: EssayIcon
        },
        {
            href: '/admin/test/providers',
            title: 'Provider Tests',
            description: 'Test AI model providers and connections',
            Icon: PlayIcon
        },
        {
            href: '/admin/test/actions/write-essay',
            title: 'Essay Writing Test',
            description: 'Test essay generation functionality',
            Icon: PenIcon
        },
        {
            href: '/admin/test/actions/write-review',
            title: 'Essay Review Test',
            description: 'Test essay review and feedback system',
            Icon: PenIcon
        },
        {
            href: '/admin/test/actions/full-system',
            title: 'Full System Test',
            description: 'Run comprehensive end-to-end testing',
            Icon: PlayIcon
        }
    ]

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Test Runner Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 no-underline"
                    >
                        <div className="card-body text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <link.Icon />
                                <h2 className="card-title m-0">{link.title}</h2>
                            </div>
                            <p className="text-base-content/70">{link.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
