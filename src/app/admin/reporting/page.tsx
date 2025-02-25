import Link from 'next/link'
import { getRootTasks } from '@/utils/repository/TaskRepo'

export default async function ReportingPage() {
    const rootTasks = await getRootTasks()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Root Tasks</h1>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Prompt</th>
                            <th>Created At</th>
                            <th>Completed</th>
                            <th>Tree View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rootTasks.map((task) => (
                            <tr key={task.id}>
                                <td>{task.prompt}</td>
                                <td>{new Date(task.created_at).toLocaleString()}</td>
                                <td>{task.completed_at ? '✓' : '−'}</td>
                                <td>
                                    <Link
                                        href={`/admin/reporting/view?taskId=${task.id}`}
                                        className="btn btn-sm btn-primary"
                                    >
                                        View Task Tree
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
