import { getTaskLogs, getTaskById } from '@/utils/repository/TaskRepo'
import { notFound } from 'next/navigation'

export default async function TaskLogsPage({
    params,
}: {
    params: { taskId: string }
}) {
    const [task, logs] = await Promise.all([
        getTaskById(params.taskId),
        getTaskLogs(params.taskId)
    ])

    if (!task) {
        notFound()
    }

    return (
        <div className="p-4">
            <div className="flex items-baseline gap-4 mb-4">
                <h1 className="text-2xl font-bold">Task Logs</h1>
                <div className="text-sm text-base-content/70">
                    Task {task.id.slice(0, 8)}
                </div>
            </div>

            <div className="card bg-base-200 mb-4">
                <div className="card-body">
                    <h2 className="card-title">Task Details</h2>
                    <p className="whitespace-pre-wrap">{task.prompt}</p>
                    <div className="text-sm text-base-content/70">
                        Created: {new Date(task.created_at).toLocaleString()}
                        {task.completed_at && (
                            <span className="ml-4">
                                Completed: {new Date(task.completed_at).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Logs</h2>
                {logs.length === 0 ? (
                    <div className="text-warning">No logs found for this task</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="text-sm text-base-content/70 mb-2">
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                                <pre className="whitespace-pre-wrap font-mono text-sm bg-base-300 p-4 rounded-lg">
                                    {log.content}
                                </pre>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
} 