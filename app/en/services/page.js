import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Business Growth Services",
  description:
    "Explore website development, SEO, Google Ads, local listings, catalogs, packaging and commercial print services from Shangjing Global.",
};

const services = [
  ["Business Website Development", "Brand positioning, multilingual information architecture, responsive design and inquiry tracking."],
  ["Website Conversion & SEO", "Technical improvements, Google-ready content, service pages, case studies, FAQs and stronger calls to action."],
  ["Google Ads Management", "Keyword research, campaign setup, landing-page alignment, conversion tracking and ongoing optimization."],
  ["Local Maps & Business Profiles", "Google Business Profile, Apple Maps, Bing Places, Yelp and market-specific local platforms."],
  ["Catalogs & Product Brochures", "Content planning, multilingual layout, product presentation, prepress and production."],
  ["Packaging & Commercial Print", "Boxes, labels, stickers, brochures, posters, business cards and trade-show materials."],
];

export default function EnglishServices() {
  return (
    <div className="page-inner page-top-pad">
      <div className="page-hero-text">
        <p className="eyebrow">SERVICES</p>
        <h1 className="page-h1">Everything your business needs<br />to be found and chosen.</h1>
        <p className="lead">We build the customer-facing system around your market, location, industry and sales process.</p>
      </div>
      <div className="expanded-services-grid">
        {services.map(([title, text], index) => (
          <article className="expanded-service-card" key={title}>
            <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </div>
      <div className="service-final-cta">
        <h2>Not sure where to begin?</h2>
        <p>Tell us about your business, target market and current challenges. We will identify the most valuable first step.</p>
        <a className="button primary" href="/en/contact">Request a Consultation <ArrowRight size={18} /></a>
      </div>
    </div>
  );
}
