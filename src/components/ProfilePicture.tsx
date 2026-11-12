import Image from "next/image";

interface ProfilePictureProps {
    src: string | null;
    size?: number;
    alt?: string;
}

export default function ProfilePicture({ src, size = 40, alt = "Profile picture" }: ProfilePictureProps) {
    return (
        <div
            className="relative aspect-square rounded-full overflow-hidden bg-white ring-1 ring-base-300"
            style={{ width: size }}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    className="h-full w-full object-contain p-[12%]"
                    width={size}
                    height={size}
                    unoptimized={src.endsWith(".svg")}
                />
            ) : (
                <div className="w-full h-full bg-base-300" />
            )}
        </div>
    );
}