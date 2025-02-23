import { createClient } from '@/utils/supabase/server'
import { Task } from '@/types'

export interface TaskTreeItem extends Task {
    level: number
}

export default async function TaskTreeView({
    searchParams,
}: {
    searchParams: { taskId?: string }
}) {
    const { taskId } = await searchParams
    if (!taskId) {
        return <div className="text-error">No task ID provided</div>
    }

    const supabase = await createClient()

    const { data: tasks, error } = await supabase
        .rpc('get_task_tree', { root_task_id: taskId })
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
            <h1 className="text-2xl font-bold mb-4">Task Tree</h1>
            <div className="grid grid-flow-col auto-cols-fr gap-4">
                {/* Group tasks by level */}
                {Array.from(new Set(tasks.map(task => task.level))).map(level => (
                    <div key={level} className="space-y-4">
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
                                            )}``
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
        </div>
    )
}