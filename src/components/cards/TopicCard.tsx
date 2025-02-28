import Link from 'next/link';
import ProfilePicture from '../ProfilePicture';
import { Topic } from '@/types';
import { DeleteTopicButton } from '@/app/admin/schedule_topics/DeleteTopicButton';

interface TopicCardProps {
    topic: Topic;
    showDelete?: boolean;
}

export default function TopicCard({ topic, showDelete = false }: TopicCardProps) {
    const CardContent = (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <h2 className="card-title text-xl font-bold">{topic.title}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-base-content/60">
                            {topic.published_at ? new Date(topic.published_at).toLocaleDateString() : 'Draft'}
                        </div>
                        {showDelete && <DeleteTopicButton topic={topic} />}
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
                    <span>{topic.author ? 'Created by' : 'Submitted by'}</span>
                    {topic.author ? (
                        <>
                            <ProfilePicture
                                src={topic.author.profile_picture_url ?? ''}
                                size={20}
                                alt={`${topic.author.name}'s profile picture`}
                            />
                            <span>{topic.author.name}</span>
                        </>
                    ) : topic.created_by_user_name ? (
                        <span className="underline">{topic.created_by_user_name}</span>
                    ) : null}
                </div>

                {topic.essay_authors && topic.essay_authors.length > 0 && (
                    <>
                        <div className="text-sm text-base-content/60 mt-1 mb-1">AUTHORS</div>
                        <div className="flex">
                            {topic.essay_authors
                                .filter((author, index, self) =>
                                    index === self.findIndex(a => a.id === author.id)
                                )
                                .map((author, index) => (
                                    <div
                                        key={author.id}
                                        className="relative"
                                        style={{
                                            marginLeft: index !== 0 ? '-12px' : '0',
                                            zIndex: topic.essay_authors!.length - index,
                                        }}
                                    >
                                        <ProfilePicture
                                            src={author.profile_picture_url ?? ''}
                                            size={32}
                                            alt={`${author.name}'s profile picture`}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <Link href={`/topics/${topic.slug}`} className="block no-underline">
            {CardContent}
        </Link>
    );
}
