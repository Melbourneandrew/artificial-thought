import { createClient } from '@/utils/supabase/server'
import { Task } from '@/types'
import Link from 'next/link'
export interface TaskTreeItem extends Task {
    level: number
    logs: Array<{
        id: string
        content: string
        created_at: string
    }>
}

export default async function TaskTreeView({
    searchParams,
}: {
    searchParams: { taskId?: string; showLogs?: string }
}) {
    const { taskId, showLogs } = searchParams
    if (!taskId) {
        return <div className="text-error">No task ID provided</div>
    }

    const supabase = await createClient()

    const { data: tasks, error } = await supabase
        .rpc('get_task_tree_with_logs', { root_task_id: taskId })
        .returns<TaskTreeItem[]>()

    console.log("Tasks: ", tasks)
    if (error) {
        return <div className="text-error">Error loading task tree: {error.message}</div>
    }

    if (!tasks?.length) {
        return <div className="text-warning">No tasks found</div>
    }

    return (
        <div className="p-4">
            <div className="flex items-baseline gap-4 mb-4">
                <h1 className="text-2xl font-bold">Task Tree</h1>
                <Link
                    href={`?taskId=${taskId}${showLogs ? '' : '&showLogs=true'}`}
                    className="btn btn-sm btn-outline"
                >
                    {showLogs ? 'Show Tasks' : 'Show Logs'}
                </Link>
                {tasks.find(task => task.level === 0) && (
                    <div className="text-sm text-base-content/70">
                        <span className="mr-2">{tasks.find(task => task.level === 0)?.prompt}</span>
                        ({new Date(tasks.find(task => task.level === 0)?.created_at || '').toLocaleString()})
                    </div>
                )}
            </div>

            {showLogs ? (
                <div className="space-y-4">
                    {tasks
                        .filter(task => task.logs?.length > 0)
                        .map((task) => (
                            <div key={task.id} className="bg-base-200 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <span className="badge badge-sm badge-primary">Level {task.level}</span>
                                    <span className="font-mono">Task {task.id.slice(0, 8)}</span>
                                    <span className="text-base-content/70">
                                        {new Date(task.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm mb-2">
                                    {task.prompt}
                                    {(task.essay_id || task.author_id) && (
                                        <span className="ml-2 text-base-content/70">
                                            •
                                            {task.essay_id && (
                                                <Link href={`/essays/${task.essay_id}`} className="link link-primary text-sm ml-2">
                                                    Essay
                                                </Link>
                                            )}
                                            {task.author_id && (
                                                <Link href={`/authors/${task.author_id}`} className="link link-secondary text-sm ml-2">
                                                    Author
                                                </Link>
                                            )}
                                            {task.topic_id && (
                                                <Link href={`/topics/id/${task.topic_id}`} className="link link-secondary text-sm ml-2">
                                                    Topic
                                                </Link>
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {task.logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="bg-base-300 p-2 rounded text-sm"
                                        >
                                            <span className="text-xs text-base-content/70">
                                                {new Date(log.created_at).toLocaleString()} →
                                            </span>{' '}
                                            {log.content}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto">
                    {/* Group tasks by level */}
                    {Array.from(new Set(tasks.map(task => task.level))).map(level => (
                        <div key={level} className="space-y-4 min-w-[400px]">
                            <h3 className="text-lg font-semibold mb-2">Level {level}</h3>
                            {tasks
                                .filter(task => task.level === level)
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className="card bg-base-200"
                                    >
                                        <div className="card-body">
                                            <h2 className="card-title flex items-center gap-2">
                                                <span className="badge badge-primary">Level {task.level}</span>
                                                Task {task.id.slice(0, 8)}
                                            </h2>
                                            <p className="whitespace-pre-wrap">{task.prompt}</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {task.completed_at && (
                                                    <span className="badge badge-success">Completed</span>
                                                )}
                                                {task.essay_id && (
                                                    <a
                                                        href={`/essays/${task.essay_id}`}
                                                        className="link link-primary"
                                                    >
                                                        Essay
                                                    </a>
                                                )}
                                                {task.author_id && (
                                                    <a
                                                        href={`/authors/${task.author_id}`}
                                                        className="link link-secondary"
                                                    >
                                                        Author
                                                    </a>
                                                )}
                                                {task.logs?.length > 0 && (
                                                    <a
                                                        href={`/admin/reporting/logs/${task.id}`}
                                                        className="link link-accent"
                                                    >
                                                        Logs
                                                    </a>
                                                )}
                                                {task.topic_id && (
                                                    <a
                                                        href={`/topics/id/${task.topic_id}`}
                                                        className="link link-secondary"
                                                    >
                                                        Topic
                                                    </a>
                                                )}
                                            </div>
                                            <div className="text-sm text-base-content/70">
                                                Created: {new Date(task.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}