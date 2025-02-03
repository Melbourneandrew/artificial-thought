import ProfilePicture from '../ProfilePicture';

interface EssayCardProps {
    title: string;
    topic: string;
    description: string;
    publishDate: string;
    authorName: string;
    authorProfilePicture: string;
}

export default function EssayCard({
    title,
    topic,
    description,
    publishDate,
    authorName,
    authorProfilePicture,
}: EssayCardProps) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <h2 className="card-title text-xl font-bold">{title}</h2>
                    <div className="text-sm text-base-content/60">{publishDate}</div>
                </div>
                <div className="badge badge-primary">{topic}</div>

                <div className="flex items-center gap-2 mt-4">
                    <ProfilePicture
                        src={authorProfilePicture}
                        size={32}
                        alt={`${authorName}'s profile picture`}
                    />
                    <span className="text-sm text-base-content/80">{authorName}</span>
                </div>

                <p className="mt-4 text-base-content/80">{description}</p>
            </div>
        </div>
    );
}
