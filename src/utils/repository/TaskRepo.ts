import { createClient } from '@/utils/supabase/server'
import { Task, Author, Topic, Essay, Review } from '@/types'

export async function createWriteEssayTask(author: Author, topic: Topic, parent: Task): Promise<Task> {
    const supabase = await createClient()
    console.log("Parent: ", parent)

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            prompt: 'write_essay',
            author_id: author.id,
            topic_id: topic.id,
            parent_task_id: parent.id
        })
        .select()
        .single()

    if (error) throw error
    if (!task) throw new Error('Failed to create task')

    return task
}

export async function createWriteReviewTask(author: Author, essay: Essay, parent: Task): Promise<Task> {
    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            prompt: 'write_review',
            author_id: author.id,
            essay_id: essay.id,
            parent_task_id: parent.id
        })
        .select()
        .single()

    if (error) throw error
    if (!task) throw new Error('Failed to create task')

    return task
}

export async function createWriteTopicTask(author: Author, parent: Task | null = null): Promise<Task> {
    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            prompt: 'write_topic',
            author_id: author.id,
            parent_task_id: parent?.id || null
        })
        .select()
        .single()

    if (error) throw error
    if (!task) throw new Error('Failed to create task')

    return task
}

export async function createTask(params: Omit<Task, 'id' | 'created_at' | 'completed_at'>): Promise<Task> {
    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            prompt: params.prompt,
            author_id: params.author_id,
            topic_id: params.topic_id,
            essay_id: params.essay_id,
            review_id: params.review_id,
            parent_task_id: params.parent_task_id
        })
        .select()
        .single()

    if (error) throw error
    if (!task) throw new Error('Failed to create task')

    return task
}

export async function getTaskById(taskId: string): Promise<Task | null> {
    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from('tasks')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at,
                model:models (
                    id,
                    model_name,
                    model_url
                )
            ),
            topic:topics (
                id,
                title,
                slug,
                published_at,
                created_at
            ),
            essay:essays (
                id,
                title,
                description,
                created_at
            ),
            review:reviews (
                id,
                content,
                created_at
            ),
            parent_task:tasks (
                id,
                prompt,
                created_at
            )
        `)
        .eq('id', taskId)
        .single()

    if (error) throw error
    if (!task) return null

    return task
}

export async function completeTask(taskId: string): Promise<Task> {
    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from('tasks')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single()

    if (error) throw error
    if (!task) throw new Error('Failed to complete task')

    return task
}

export async function getPendingTasksForAuthor(authorId: string): Promise<Task[]> {
    const supabase = await createClient()

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at
            ),
            topic:topics (
                id,
                title,
                slug,
                published_at,
                created_at
            ),
            essay:essays (
                id,
                title,
                description,
                created_at
            ),
            review:reviews (
                id,
                content,
                created_at
            )
        `)
        .eq('author_id', authorId)
        .is('completed_at', null)
        .order('created_at', { ascending: true })

    if (error) throw error
    if (!tasks) return []

    return tasks
}

export async function getRootTasks(): Promise<Task[]> {
    const supabase = await createClient()

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .is('parent_task_id', null)
        .order('created_at', { ascending: false })

    if (error) throw error
    if (!tasks) return []

    return tasks
}

export async function createTaskLog(taskId: string, content: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('task_logs')
        .insert({
            task_id: taskId,
            content: content
        })

    if (error) throw error
}

export interface TaskLog {
    id: string
    content: string
    created_at: string
    task_id: string
}

export async function getTaskLogs(taskId: string): Promise<TaskLog[]> {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
        .from('task_logs')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

    if (error) throw error
    if (!logs) return []

    return logs
}
