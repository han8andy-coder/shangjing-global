import { ArrowRight, BookOpen, Box, Globe2, MapPinned, Megaphone, SearchCheck } from "lucide-react";

const services = [
  [Globe2, "Business Websites", "Conversion-focused, mobile-ready websites built for local and international markets."],
  [SearchCheck, "Website & SEO Optimization", "Improve speed, search structure, service pages, trust signals and inquiry paths."],
  [Megaphone, "Google Ads", "Keyword strategy, campaign setup, landing pages and conversion tracking."],
  [MapPinned, "Local Maps & Business Listings", "Google Business Profile and the right map, directory or review platform for each market."],
  [BookOpen, "Catalogs & Brochures", "Multilingual company catalogs, product books and sales materials from concept to print."],
  [Box, "Packaging & Print", "Packaging, labels, boxes, trade-show materials and commercial printing."],
];

export default function EnglishHome() {
  return (
    <>
      <section className="growth-hero page-inner">
        <div>
          <p className="eyebrow">WEBSITES · ADS · LOCAL MAPS · PRINT</p>
          <h1>Build a complete system<br /><span>for customer growth.</span></h1>
          <p className="lead">Shangjing Global helps businesses get discovered, earn trust and generate inquiries through websites, Google Ads, local business listings, catalogs, packaging and print.</p>
          <div className="hero-actions">
            <a className="button primary" href="/en/contact">Discuss Your Growth Plan <ArrowRight size={18} /></a>
            <a className="button secondary" href="/en/services">Explore Services</a>
          </div>
        </div>
        <div className="growth-system-card">
          <p className="system-kicker">SHANGJING GROWTH SYSTEM</p>
          <h2>From visibility to inquiry</h2>
          <div className="system-flow english-flow">
            <span>Website</span><i>→</i><span>Local Maps</span><i>→</i><span>Google Ads</span><i>→</i><span>Leads</span>
          </div>
          <div className="system-note"><SearchCheck size={18} />Market-specific channels, content and language—not a one-size-fits-all package.</div>
        </div>
      </section>
      <section className="business-section">
        <div className="page-inner">
          <div className="section-title"><p className="eyebrow">OUR SERVICES</p><h2>Digital acquisition and brand production in one team</h2></div>
          <div className="business-grid english-grid">
            {services.map(([Icon, title, text]) => <article className="business-card" key={title}><Icon size={26} /><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <div className="steps-cta"><a className="button primary" href="/en/contact">Start a Conversation <ArrowRight size={18} /></a></div>
        </div>
      </section>
    </>
  );
}
