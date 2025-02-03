'use client'
import { useFormStatus } from 'react-dom';

export default function NewPostButton({ formAction }: { formAction: (formData: FormData) => Promise<void> }) {
    const { pending } = useFormStatus();

    return <button className="btn btn-primary" formAction={formAction}>
        {pending && <span className="loading loading-spinner"></span>}
        Create Post
    </button>
}