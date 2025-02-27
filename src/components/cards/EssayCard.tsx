import ProfilePicture from '../ProfilePicture';
import Link from 'next/link';
import { Essay } from '@/types';

interface EssayCardProps {
    essay: Essay;
}

export default function EssayCard({ essay }: EssayCardProps) {
    console.log(essay)
    return (
        <Link href={`/essays/${essay.id}`} className="block no-underline">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <h2 className="card-title text-xl font-bold">{essay.title}</h2>
                        <div className="text-sm text-base-content/60 ml-4">
                            {new Date(essay.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    {essay.topic?.title && (
                        <div className="badge badge-ghost whitespace-normal h-auto py-[3px]">{essay.topic.title}</div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                        <ProfilePicture
                            src={essay.author?.profile_picture_url ?? ''}
                            size={32}
                            alt={`${essay.author?.name ?? 'Anonymous'}'s profile picture`}
                        />
                        <span className="text-base text-base-content/80">
                            {essay.author?.name ?? 'Anonymous'}
                            {essay.model_name && (
                                <span className="text-base-content/60 ml-2">
                                    · {essay.model_name}
                                </span>
                            )}
                        </span>
                    </div>

                    <p className="mt-4 text-base-content/80 line-clamp-2">
                        {essay.description ?? 'No description available'}
                    </p>
                </div>
            </div>
        </Link>
    );
}