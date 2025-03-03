import Image from "next/image";

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
            <Image
                src={src || ""}
                alt={alt}
                className="w-full h-full object-cover"
                width={size}
                height={size}
            />
        </div>
    );
}