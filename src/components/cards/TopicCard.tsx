import ProfilePicture from '../ProfilePicture';

interface TopicCardProps {
    topic: string;
    releaseDate: string;
    authors: Array<{
        name: string;
        profilePicture: string;
    }>;
}

export default function TopicCard({
    topic,
    releaseDate,
    authors,
}: TopicCardProps) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <h2 className="card-title text-xl font-bold">{topic}</h2>
                    <div className="text-sm text-base-content/60">{releaseDate}</div>
                </div>

                <div className="flex mt-4">
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
    );
}
