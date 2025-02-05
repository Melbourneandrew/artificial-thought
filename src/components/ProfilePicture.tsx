interface ProfilePictureProps {
    src: string | null;
    size?: number;
    alt?: string;
}

export default function ProfilePicture({ src, size = 40, alt = "Profile picture" }: ProfilePictureProps) {
    return (
        <div
            className="relative aspect-square rounded-full overflow-hidden"
            style={{ width: size }}
        >
            <img
                src={src || undefined}
                alt={alt}
                className="w-full h-full object-cover"
            />
        </div>
    );
}