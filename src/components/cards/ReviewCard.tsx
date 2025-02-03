import ProfilePicture from '../ProfilePicture';

interface ReviewCardProps {
    authorName: string;
    authorProfilePicture: string;
    content: string;
    reviewDate: string;
}

export default function ReviewCard({
    authorName,
    authorProfilePicture,
    content,
    reviewDate,
}: ReviewCardProps) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ProfilePicture
                            src={authorProfilePicture}
                            size={48}
                            alt={`${authorName}'s profile picture`}
                        />
                        <span className="font-semibold text-lg">{authorName}</span>
                    </div>
                    <div className="text-sm text-base-content/60">{reviewDate}</div>
                </div>

                <p className="mt-4 text-base-content/80">{content}</p>
            </div>
        </div>
    );
}
