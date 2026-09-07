import { Link } from "react-router-dom";
import psgLogo from "../assets/clubs/psg-logo.png";
import pfcLogo from "../assets/clubs/pfc-logo.png";
import versaillesLogo from "../assets/clubs/versailles-logo.png";

/**
 * LogoTicker — carrousel de logos clubs sur la home
 * ─────────────────────────────────────────────────────────────────────────
 * Chaque logo est cliquable → redirige vers la fiche organisateur
 * (/organizer/:name). Si le nom du club ne matche pas un vrai organisateur
 * en DB, la fiche affichera un fallback.
 */

const LogoTicker = () => {
  const logos = [
    { src: psgLogo, alt: "PSG", name: "Paris Saint-Germain" },
    { src: pfcLogo, alt: "Paris FC", name: "Paris FC" },
    { src: "/lovable-uploads/08c4f6e7-de7f-490a-92cd-ab192d330279.png", alt: "Versailles FC", name: "Versailles FC" },
    { src: "/lovable-uploads/2a2ac2c8-7c11-4e98-b943-009ee7bbfa5c.png", alt: "Top 14 Rugby", name: "Top 14 Rugby" },
    { src: "/lovable-uploads/34effd51-a6cb-4bec-b8d7-d61426b355d6.png", alt: "Roland Garros", name: "Roland Garros" },
    { src: "/lovable-uploads/8aad4de9-74f9-4c82-9119-9e94dd067261.png", alt: "Rolex Paris Masters", name: "Rolex Paris Masters" },
    { src: "/lovable-uploads/a2894542-6a3d-4286-b7f2-a7a17728aee5.png", alt: "Paris FC New", name: "Paris FC" },
    { src: "/lovable-uploads/7334e868-cc93-4188-894e-6f7066ad5a99.png", alt: "Red Star FC", name: "Red Star FC" },
    { src: "/lovable-uploads/6a36cd92-4abc-4cd6-a438-d6faf357ef4e.png", alt: "Stade Français", name: "Stade Français" },
    { src: "/lovable-uploads/a204fb77-efa7-4cc3-8fb6-096b54a0ad71.png", alt: "Racing 92", name: "Racing 92" },
    { src: "/lovable-uploads/3b68fa36-0f64-42fa-bc8e-d0781a1dab9f.png", alt: "Paris Basket", name: "Paris Basketball" },
    { src: "/lovable-uploads/f67d5787-0bc1-4ea7-ad6c-2d963ea6db91.png", alt: "Nanterre 92", name: "Nanterre 92" },
    { src: "/lovable-uploads/ebd99088-d4e1-4def-9c5f-a71294f9e53c.png", alt: "Levallois Metropolitans", name: "Levallois Metropolitans" },
    { src: "/lovable-uploads/abad0fd2-2cc4-4821-b144-8b0dfb13912d.png", alt: "USC Handball", name: "USC Handball" },
    { src: "/lovable-uploads/20f1ae6b-3638-432a-9892-ad2cd5d37906.png", alt: "Racing Club de France", name: "Racing Club de France" },
    { src: "/lovable-uploads/f7260997-3f77-4ca9-8e25-6945c10a2711.png", alt: "Garmin Triathlon Paris", name: "Garmin Triathlon Paris" },
    { src: "/lovable-uploads/7b9ccfc3-4cad-4647-9a2f-f8c490fcdd8c.png", alt: "France Rugby", name: "France Rugby" },
    { src: "/lovable-uploads/1fa9cbb3-3ec6-426f-a18a-4323c7d35960.png", alt: "HYROX", name: "HYROX" },
    { src: "/lovable-uploads/f2330819-356a-4512-a76a-609eaaec5ea5.png", alt: "Marathon de Paris", name: "Marathon de Paris" },
    { src: "/lovable-uploads/e59b4674-e9ba-4cdc-a6ec-2a0ee62e29c7.png", alt: "Stade de France", name: "Stade de France" },
  ];

  const renderLogo = (logo: { src: string; alt: string; name: string }, key: string) => (
    <Link
      key={key}
      to={`/organizer/${encodeURIComponent(logo.name)}`}
      className="shrink-0"
      aria-label={`Voir les événements de ${logo.name}`}
      title={logo.name}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className="h-10 w-auto opacity-70 hover:opacity-100 transition-all filter grayscale hover:grayscale-0 hover:scale-110 cursor-pointer"
      />
    </Link>
  );

  return (
    <section className="relative overflow-hidden z-10">
      <div className="flex animate-scroll">
        {/* Premier ensemble de logos */}
        <div className="flex items-center space-x-12 md:space-x-16 min-w-max py-6">
          {logos.map((logo, index) => renderLogo(logo, `logo-1-${index}`))}
        </div>
        {/* Duplicate pour un défilement continu */}
        <div className="flex items-center space-x-12 md:space-x-16 min-w-max py-6">
          {logos.map((logo, index) => renderLogo(logo, `logo-2-${index}`))}
        </div>
      </div>
    </section>
  );
};

export default LogoTicker;
