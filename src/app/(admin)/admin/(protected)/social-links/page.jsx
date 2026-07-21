import SocialLinksForm from "./SocialLinksForm";

export const metadata = {
  title: "Social Links Management | Admin",
  description: "Manage all your professional social media profiles and links",
};

export default function SocialLinksPage() {
  return (
    <div>
      <SocialLinksForm />
    </div>
  );
}
