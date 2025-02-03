import { createClient } from '@/utils/supabase/server';
import { editPost } from './actions';
import { redirect } from 'next/navigation';

async function getPost(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        redirect('/admin');
    }

    return data;
}

export default async function EditPostPage({
    searchParams
}: {
    searchParams: Promise<{ id: string }>
}) {
    const { id } = await searchParams;

    if (!id) {
        redirect('/admin');
    }

    const post = await getPost(id);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
            <form action={editPost} className="space-y-4">
                <input type="hidden" name="postId" value={post.id} />

                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={post.title}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        defaultValue={post.slug}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={post.description}
                        className="textarea textarea-bordered w-full"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-1">
                        Content (Markdown file) - Leave empty to keep existing content
                    </label>
                    <input
                        type="file"
                        id="content"
                        name="content"
                        accept=".md"
                        className="file-input file-input-bordered w-full"
                    />
                </div>

                <div>
                    <label htmlFor="og-image-url" className="block text-sm font-medium mb-1">
                        OG Image URL (optional)
                    </label>
                    <input
                        type="text"
                        id="og-image-url"
                        name="og-image-url"
                        defaultValue={post.og_image}
                        className="input input-bordered w-full"
                    />
                </div>

                <div>
                    <label htmlFor="created-at" className="block text-sm font-medium mb-1">
                        Post Date
                    </label>
                    <input
                        type="datetime-local"
                        id="created-at"
                        name="created-at"
                        defaultValue={new Date(post.created_at).toISOString().slice(0, 16)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="btn btn-primary">
                        Update Post
                    </button>
                    <a href="/admin" className="btn">
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}
