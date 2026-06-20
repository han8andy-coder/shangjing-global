import { CheckCircle2 } from "lucide-react";
import LeadForm from "../../components/LeadForm";

export const metadata = {
  title: "Contact",
  description:
    "Tell Shangjing Global about your business, market and growth challenge. Start a conversation about websites, advertising, local listings or print.",
};

export default function EnglishContact() {
  return (
    <div className="page-inner page-top-pad">
      <div className="english-contact">
        <div>
          <p className="eyebrow">CONTACT</p>
          <h1 className="page-h1">Tell us what your business needs to grow.</h1>
          <p className="lead">Share your business type, location, target customers and current challenge. We will recommend the right combination of digital and print services.</p>
          <ul className="english-contact-list">
            {["Website development or optimization", "Google Ads and lead generation", "Local maps and business profiles", "Catalogs, packaging and commercial print"].map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}
          </ul>
        </div>
        <LeadForm language="en" />
      </div>
    </div>
  );
}
