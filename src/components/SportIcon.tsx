interface SportIconProps {
  sport: string;
  className?: string;
}

export const SportIcon = ({ sport, className = "w-5 h-5" }: SportIconProps) => {
  const getIcon = () => {
    switch (sport.toLowerCase()) {
      case 'football':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 2C12 2 15.5 6 12 10S8.5 6 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 22C12 22 8.5 18 12 14S15.5 18 12 22Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M2 12C2 12 6 8.5 10 12S6 15.5 2 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M22 12C22 12 18 15.5 14 12S18 8.5 22 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      
      case 'basketball':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 2V22" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 7C9 9 9 15 7 17" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M17 7C15 9 15 15 17 17" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );

      case 'tennis':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 3C15.5 6.5 15.5 17.5 12 21" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 3C8.5 6.5 8.5 17.5 12 21" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );

      case 'rugby':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 6V18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 9L15 15" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );

      case 'handball':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 10V16" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 13L15 13" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 16L14 16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );

      case 'volleyball':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M3 12C5 8 8 6 12 6S19 8 21 12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M3 12C5 16 8 18 12 18S19 16 21 12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );

      case 'natation':
      case 'swimming':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 16C5 14 7 16 9 14S13 14 15 16S19 16 21 14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M3 20C5 18 7 20 9 18S13 18 15 20S19 20 21 18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M14 9L18 5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M16 7L20 3" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );

      case 'cyclisme':
      case 'cycling':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M9 18H15" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 6L15 18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 6L9 18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 6H14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );

      case 'course':
      case 'course à pied':
      case 'running':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="10" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10L12 8L14 12L16 10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 12V18" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 16L10 18L12 16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M14 20L16 18L18 20" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center justify-center text-muted-foreground">
      {getIcon()}
    </div>
  );
};