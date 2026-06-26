import { Check } from "lucide-react";

type AvatarProfilePhotoProps = {
  alt: string;
  src: string;
  verified?: boolean;
  size?: "sm" | "md" | "lg";
};

export function AvatarProfilePhoto({ alt, src, verified = false, size = "md" }: AvatarProfilePhotoProps) {
  return (
    <span className={`avatar-profile-photo avatar-profile-photo--${size}`}>
      <img src={src} alt={alt} />
      {verified ? (
        <span className="avatar-profile-photo__verified" aria-label="Verified profile">
          <Check size={14} strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}
