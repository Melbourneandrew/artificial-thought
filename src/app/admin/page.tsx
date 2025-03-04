import Link from 'next/link'
import PromptIcon from '@/components/icons/PromptIcon'
import ModelIcon from '@/components/icons/ModelIcon'
import PlayIcon from '@/components/icons/PlayIcon'
import CalendarIcon from '@/components/icons/CalendarIcon'
import ReportIcon from '@/components/icons/ReportIcon'
export default function AdminDashboard() {
    const adminLinks = [
        {
            href: '/admin/prompts',
            title: 'Prompt Management',
            description: 'Create and manage system prompts',
            Icon: PromptIcon
        },
        {
            href: '/admin/manage_models',
            title: 'Model Management',
            description: 'Configure and manage AI models',
            Icon: ModelIcon
        },
        {
            href: '/admin/test',
            title: 'System Tests',
            description: 'Test providers, actions, ui, etc.',
            Icon: PlayIcon
        },
        {
            href: '/admin/schedule_topics',
            title: 'Topic Scheduler',
            description: 'Schedule and manage content topics',
            Icon: CalendarIcon
        },
        {
            href: '/admin/reporting',
            title: 'Reporting',
            description: 'View system analytics and reports',
            Icon: ReportIcon
        }
    ]

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminLinks.map((link) => (
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
