import { createClient } from '@/utils/supabase/client';
import PlusIcon from '@/components/icons/PlusIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import Link from 'next/link';
import { revalidateBlogHome, deletePost } from './new-post/actions';
import { EditIcon } from '@/components/icons/EditIcon';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    created_at: string;
    slug: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export default async function AdminPage() {
    const blogPosts = await getBlogPosts();

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Blog Posts</h1>
                    <Link href="/" className="link">Go to blog</Link>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={revalidateBlogHome}
                        className="btn btn-primary"
                    >
                        Revalidate Blog Home
                    </button>
                    <Link
                        href="/admin/new-post"
                        className="btn btn-primary"
                    >
                        <PlusIcon />
                        Add New Post
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                {blogPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Add some posts!
                    </div>
                ) : (
                    blogPosts.map((post: BlogPost) => (
                        <div key={post.id} className="card bg-base-100 shadow-xl">
                            <div className="card-body flex-row items-center">
                                <div className="flex-1">
                                    <h2 className="card-title">{post.title}</h2>
                                    <p className="text-sm text-gray-500">Published: {new Date(post.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/edit-post?id=${post.id}`}
                                        className="btn btn-ghost btn-circle"
                                    >
                                        <EditIcon />
                                    </Link>
                                    <form action={async () => {
                                        'use server';
                                        await deletePost(post.id);
                                    }}>
                                        <button type="submit" className="btn btn-ghost btn-circle">
                                            <TrashIcon />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
