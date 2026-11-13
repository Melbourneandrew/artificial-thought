import ProfilePicture from '../ProfilePicture';
import Link from 'next/link';
import { Author } from '@/types';

interface AuthorCardProps {
    author: Author;
    bio?: string;
    withLink?: boolean;
}

function formatDay(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value))
}

function activeDates(author: Author): string | null {
    if (!author.first_essay_at || !author.last_essay_at) return null
    const first = formatDay(author.first_essay_at)
    const last = formatDay(author.last_essay_at)
    return first === last ? first : `${first} – ${last}`
}

export default function AuthorCard({ author, bio, withLink = true }: AuthorCardProps) {
    const dates = activeDates(author)
    const retired = author.status === 'retired'
    const card = (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
                <div className="flex items-center gap-4">
                    <ProfilePicture
                        src={author.profile_picture_url || ''}
                        size={64}
                        alt={`${author.name}'s profile picture`}
                    />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="card-title">{author.name}</h2>
                            {retired && <span className="badge badge-outline badge-sm">Retired</span>}
                        </div>
                        <div className="badge badge-ghost whitespace-normal h-auto py-[3px] mt-1">
                            {author.model?.model_name || 'Unknown Model'}
                        </div>
                        {typeof author.essay_count === 'number' && (
                            <p className="mt-2 text-sm text-base-content/70">{author.essay_count} {author.essay_count === 1 ? 'essay' : 'essays'}</p>
                        )}
                        {dates && <p className="text-sm text-base-content/60">{dates}</p>}
                    </div>
                </div>
                {bio && <p className="mt-4 text-base-content/80">{bio}</p>}
            </div>
        </div>
    );

    if (withLink) {
        return (
            <Link href={`/authors/${author.id}`} className="hover:shadow-2xl transition-shadow no-underline">
                {card}
            </Link>
        );
    }

    return card;
}
