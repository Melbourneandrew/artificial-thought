import Link from 'next/link';
import ProfilePicture from '../ProfilePicture';

interface TopicCardProps {
    topic: {
        title: string;
        slug: string;
        published_at: string | null;
    };
    authors: Array<{
        name: string;
        profilePicture: string;
    }>;
}

export default function TopicCard({
    topic,
    authors,
}: TopicCardProps) {
    return (
        <Link href={`/topics/${topic.slug}`} className="block no-underline">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <h2 className="card-title text-xl font-bold">{topic.title}</h2>
                        <div className="text-sm text-base-content/60">
                            {topic.published_at ? new Date(topic.published_at).toLocaleDateString() : 'Draft'}
                        </div>
                    </div>

                    <div className="text-sm text-base-content/60 mt-1 mb-1">AUTHORS</div>
                    <div className="flex">
                        {authors.map((author, index) => (
                            <div
                                key={author.name}
                                className="relative"
                                style={{
                                    marginLeft: index !== 0 ? '-12px' : '0',
                                    zIndex: authors.length - index,
                                }}
                            >
                                <ProfilePicture
                                    src={author.profilePicture}
                                    size={32}
                                    alt={`${author.name}'s profile picture`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
