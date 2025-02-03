'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface BlogPostUpdateData {
    title: string;
    slug: string;
    description: string;
    og_image: string;
    created_at: string;
    content?: string;
}

export async function editPost(formData: FormData) {
    const supabase = await createClient();
    const postId = formData.get('postId')?.toString();
    const title = formData.get('title')?.toString();
    const content = formData.get('content') as File | null;
    const description = formData.get('description')?.toString();
    const slug = formData.get('slug')?.toString();
    const ogImageUrl = (formData.get('og-image-url') ?? '').toString();
    const createdAt = formData.get('created-at')?.toString();

    if (!postId || !title || !description || !slug || !createdAt) {
        throw new Error('Missing required fields');
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug.toString())) {
        throw new Error('Invalid slug format. Use only lowercase letters, numbers, and hyphens.');
    }

    try {
        const updateData: BlogPostUpdateData = {
            title,
            slug,
            description,
            og_image: ogImageUrl,
            created_at: createdAt
        };

        if (content instanceof File && content.size > 0) {
            console.log('Content is a file');
            const markdownContent = await content.text();
            updateData.content = markdownContent;
        }

        console.log(updateData);

        const { error, data } = await supabase
            .from('blog_posts')
            .update(updateData)
            .eq('id', postId);

        console.log('Supabase response:', { error, data });

        if (error?.code === '23505') throw new Error('A post with this slug already exists.');
        if (error) throw new Error(`Failed to update post: ${error.message}`);
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }

    revalidatePath('/blog/post/[slug]', 'layout');
    revalidatePath('/admin');
    revalidatePath('/');
    redirect('/admin');
}
