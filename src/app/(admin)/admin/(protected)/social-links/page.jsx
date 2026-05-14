import SocialLinksForm from "./SocialLinksForm";

export const metadata = {
  title: "Social Links Management | Admin",
  description: "Manage all your professional social media profiles and links",
};

export default function SocialLinksPage() {
  return (
    <div className="px-6 py-10">
      <SocialLinksForm />
    </div>
  );
}
