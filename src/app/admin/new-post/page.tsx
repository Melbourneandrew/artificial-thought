"use client"

import { createPost } from './actions';
import { useActionState } from 'react';
import { useState, useEffect } from 'react';

export default function NewPost() {
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const [state, formAction] = useActionState(createPost, { error: '', loading: false });

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

            <form action={formAction} className="max-w-2xl">
                {state?.error && (
                    <div className="alert alert-error mb-4">
                        <span>{state.error}</span>
                    </div>
                )}
                {/* Title Input */}
                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Post Title</span>
                    </label>
                    <input
                        name="title"
                        type="text"
                        placeholder="Enter post title"
                        className="input input-bordered w-full"
                        onChange={(e) => {
                            // Auto-generate slug from title
                            const slug = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '');
                            const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                            if (slugInput) slugInput.value = slug;
                        }}
                        required
                    />
                </div>
                {/* Slug Input */}
                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">URL Slug (goes in the URL bar)</span>
                    </label>
                    <label className="input flex items-center gap-2 p-0">
                        {`${baseUrl}/blog/post/`}
                        <input
                            name="slug"
                            type="text"
                            placeholder="enter-url-slug"
                            className="input input-bordered w-full"
                            required
                        />
                    </label>
                </div>
                {/* Open Graph Meta Image URL Input */}
                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Open Graph Meta Image URL</span>
                    </label>
                    <input
                        name="og-image-url"
                        type="text"
                        placeholder="Enter URL of Open Graph image"
                        className="input input-bordered w-full"
                    />
                </div>
                {/* Post Description Input */}
                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Description</span>
                    </label>
                    <textarea
                        name="description"
                        placeholder="Enter a brief description of your post"
                        className="textarea textarea-bordered w-full h-24"
                        required
                    />
                </div>
                {/* Content Markdown File Input */}
                <div className="form-control w-full mb-6">
                    <label className="label">
                        <span className="label-text">Content (Markdown)</span>
                    </label>
                    <input
                        name="content"
                        type="file"
                        accept=".md,.markdown"
                        className="file-input file-input-bordered w-full"
                        required
                    />
                </div>

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={state?.loading}
                >
                    {state?.loading && <span className="loading loading-spinner"></span>}
                    Create Post
                </button>
            </form>
        </div>
    );
}
