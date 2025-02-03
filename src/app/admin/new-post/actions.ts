'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(prevState: { loading: boolean, error: string }, formData: FormData) {
    const supabase = await createClient();
    const title = formData.get('title');
    const content = formData.get('content') as File;
    const description = formData.get('description');
    const slug = formData.get('slug');
    const ogImageUrl = formData.get('og-image-url') ?? '';

    if (!title || !content || !description || !slug) {
        return { error: 'Missing required fields', loading: false };
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug.toString())) {
        return {
            error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.',
            loading: false
        };
    }

    const markdownContent = await content.text();

    try {
        const { error } = await supabase
            .from('blog_posts')
            .insert({
                title: title,
                slug: slug,
                content: markdownContent,
                description: description,
                og_image: ogImageUrl
            });
        if (error?.code === '23505') return { error: 'A post with this slug already exists.', loading: false };
        if (error) return { error: 'Failed to create post', loading: false };

    } catch (error) {
        console.error('Error saving post:', error);
        return { error: 'Failed to create post', loading: false };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    redirect('/admin');
}

export async function revalidateBlogHome() {
    revalidatePath('/blog/post/[slug]', 'layout');
    revalidatePath('/');
}

export async function deletePost(postId: number) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/blog/post/[slug]', 'layout');

        return { success: true };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: 'Failed to delete post' };
    }
}
