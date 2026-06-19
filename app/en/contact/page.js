import { ArrowRight, CheckCircle2 } from "lucide-react";

const message = encodeURIComponent("Hello Shangjing Global, I would like to discuss website, advertising, local maps, catalog, packaging or print services for my business.");

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
        <div className="contact-form-card english-contact-card">
          <p className="form-title">Speak with our team</p>
          <p>Start a WhatsApp conversation and include your company name, website, market and the service you are interested in.</p>
          <a className="button primary wide" href={`https://wa.me/13475768888?text=${message}`} target="_blank" rel="noreferrer">
            Contact on WhatsApp <ArrowRight size={18} />
          </a>
          <p className="contact-number">WhatsApp: +1 347-576-8888</p>
        </div>
      </div>
    </div>
  );
}
