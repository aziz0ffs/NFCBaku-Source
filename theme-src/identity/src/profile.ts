export interface Profile {
  name: string;
  monogram: string;
  profession?: string;
  location: string;
  portrait: { src: string; alt: string; position: string };
  biography: string;
  quote: string;
  phone?: string;
  email?: string;
  canonicalUrl?: string;
  clickEndpoint?: string;
  social: {
    id?: number;
    label: string;
    description: string;
    url: string;
    icon: "instagram" | "message" | "web";
  }[];
  appearance: {
    background: string;
    accent: string;
    card: string;
    displayFont: string;
    motion: "full" | "subtle" | "off";
    video?: { src: string; poster: string };
  };
  additionalPhotos?: { src: string; alt: string }[];
  sections?: { title: string; text: string }[];
}
// Public data supplied by the existing LinkStack user and links models.
const data = document.getElementById("identity-profile");
if (!data) throw new Error("Missing LinkStack profile data");
export const profile: Profile = JSON.parse(data.textContent || "{}");
