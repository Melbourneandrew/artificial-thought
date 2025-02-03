'use client';

import { useRouter } from 'next/navigation';
import PlusIcon from '@/components/icons/PlusIcon';

export default function AddNewPostButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/admin/new-post')}
            className="btn btn-primary"
        >
            <PlusIcon />
            Add New Post
        </button>
    );
} 