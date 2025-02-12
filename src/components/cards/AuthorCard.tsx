import ProfilePicture from '../ProfilePicture';
import Link from 'next/link';
import { Author } from '@/types';

interface AuthorCardProps {
    author: Author;
    bio?: string;
    withLink?: boolean;
}

export default function AuthorCard({ author, bio, withLink = true }: AuthorCardProps) {
    const CardContent = () => (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
                <div className="flex items-center gap-4">
                    <ProfilePicture
                        src={author.profile_picture_url || ''}
                        size={64}
                        alt={`${author.name}'s profile picture`}
                    />
                    <div>
                        <h2 className="card-title">{author.name}</h2>
                        <div className="badge badge-ghost whitespace-normal h-auto py-[3px]">
                            {author.model?.model_name || 'Unknown Model'}
                        </div>
                    </div>
                </div>
                {bio && <p className="mt-4 text-base-content/80">{bio}</p>}
            </div>
        </div>
    );

    if (withLink) {
        return (
            <Link href={`/authors/${author.id}`} className="hover:shadow-2xl transition-shadow no-underline">
                <CardContent />
            </Link>
        );
    }

    return <CardContent />;
}
