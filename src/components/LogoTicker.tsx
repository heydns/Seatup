import psgLogo from "../assets/clubs/psg-logo.png";
import pfcLogo from "../assets/clubs/pfc-logo.png";
import versaillesLogo from "../assets/clubs/versailles-logo.png";

const LogoTicker = () => {
  const logos = [
    { src: psgLogo, alt: "PSG" },
    { src: pfcLogo, alt: "Paris FC" },
    { src: "/lovable-uploads/08c4f6e7-de7f-490a-92cd-ab192d330279.png", alt: "Versailles FC" },
    { src: "/lovable-uploads/2a2ac2c8-7c11-4e98-b943-009ee7bbfa5c.png", alt: "Top 14 Rugby" },
    { src: "/lovable-uploads/34effd51-a6cb-4bec-b8d7-d61426b355d6.png", alt: "Roland Garros" },
    { src: "/lovable-uploads/8aad4de9-74f9-4c82-9119-9e94dd067261.png", alt: "Rolex Paris Masters" },
    { src: "/lovable-uploads/a2894542-6a3d-4286-b7f2-a7a17728aee5.png", alt: "Paris FC New" },
    { src: "/lovable-uploads/7334e868-cc93-4188-894e-6f7066ad5a99.png", alt: "Red Star FC" },
    { src: "/lovable-uploads/6a36cd92-4abc-4cd6-a438-d6faf357ef4e.png", alt: "Stade Français" },
    { src: "/lovable-uploads/a204fb77-efa7-4cc3-8fb6-096b54a0ad71.png", alt: "Racing 92" },
    { src: "/lovable-uploads/3b68fa36-0f64-42fa-bc8e-d0781a1dab9f.png", alt: "Paris Basket" },
    
    { src: "/lovable-uploads/7b9ccfc3-4cad-4647-9a2f-f8c490fcdd8c.png", alt: "France Rugby" },
    { src: "/lovable-uploads/1fa9cbb3-3ec6-426f-a18a-4323c7d35960.png", alt: "HYROX" },
    { src: "/lovable-uploads/f2330819-356a-4512-a76a-609eaaec5ea5.png", alt: "Marathon de Paris" },
    { src: "/lovable-uploads/e59b4674-e9ba-4cdc-a6ec-2a0ee62e29c7.png", alt: "Stade de France" },
  ];

  return (
    <section className="relative overflow-hidden z-10">
      <div className="flex animate-scroll">
        {/* Premier ensemble de logos */}
        <div className="flex items-center space-x-12 md:space-x-16 min-w-max py-6">
          {logos.map((logo, index) => (
            <img
              key={`logo-1-${index}`}
              src={logo.src}
              alt={logo.alt}
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0"
            />
          ))}
        </div>
        {/* Duplicate pour un défilement continu */}
        <div className="flex items-center space-x-12 md:space-x-16 min-w-max py-6">
          {logos.map((logo, index) => (
            <img
              key={`logo-2-${index}`}
              src={logo.src}
              alt={logo.alt}
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoTicker;