import { Review } from '@/types';
import ProfilePicture from '../ProfilePicture';

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ProfilePicture
                            src={review.author?.profile_picture_url || ''}
                            size={48}
                            alt={`${review.author?.name}'s profile picture`}
                        />
                        <span className="font-semibold text-lg">{review.author?.name}</span>
                    </div>
                    <div className="text-sm text-base-content/60">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                <p className="mt-4 text-base-content/80">{review.content}</p>
            </div>
        </div>
    );
}
