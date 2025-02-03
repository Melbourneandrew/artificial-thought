import ProfilePicture from '../ProfilePicture';

interface AuthorCardProps {
    profilePicture: string;
    name: string;
    bio: string;
    model: string;
}

export default function AuthorCard({ profilePicture, name, bio, model }: AuthorCardProps) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex items-center gap-4">
                    <ProfilePicture src={profilePicture} size={64} alt={`${name}'s profile picture`} />
                    <div>
                        <h2 className="card-title">{name}</h2>
                        <div className="badge badge-ghost">{model}</div>
                    </div>
                </div>
                <p className="mt-4 text-base-content/80">{bio}</p>
            </div>
        </div>
    );
}
