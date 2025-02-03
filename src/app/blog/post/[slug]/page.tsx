import { createClient } from '@/utils/supabase/client'
import Markdown from 'react-markdown'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createClient();

    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('og_image, title, description')
        .eq('slug', slug)
        .single()

    if (!post || error) {
        return {};
    }

    const title = post['title'] + ' | Andrew Melbourne\'s Development Blog';

    return {
        title: title,
        description: post['description'],
        openGraph: {
            images: [post['og_image']],
        },
    }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = createClient();
    const author = process.env.NEXT_PUBLIC_BLOG_AUTHOR;
    const { slug } = await params;

    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('title, description, content, created_at')
        .eq('slug', slug)
        .single()

    if (error || !post) {
        notFound()
    }

    return (
        <article className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                    <p className="text-gray-600">
                        By {author} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                </div>
                <Link href="/" className="inline-flex items-center align-center gap-2 hover:text-gray-900">
                    Blog Home
                </Link>
            </div>
            <div className="prose prose-lg prose-headings:mb-1 prose-headings:mt-0 prose-code:mt-0 prose-pre:mt-0 prose-img:m-0 max-w-none">
                <Markdown>{post.content}</Markdown>
            </div>
        </article>
    )
}
