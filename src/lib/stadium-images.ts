// Système centralisé de gestion des images de stades
// Permet de gérer facilement les images avec des fallbacks appropriés

const STADIUM_IMAGES = {
  // Images par défaut pour différents types de stades
  defaults: {
    "Stade": "/lovable-uploads/parc-des-princes-night.jpg",
    "Salle omnisports": "/lovable-uploads/pierre-coubertin.jpg", 
    "Salle polyvalente": "/lovable-uploads/2a65224f-97c7-457b-a5e7-697fb6fb61f3.png",
    "Arena": "/lovable-uploads/u-arena.jpg",
    "Pelouse synthétique": "/lovable-uploads/u-arena.jpg",
    "Parquet": "/lovable-uploads/pierre-coubertin.jpg",
    "Terre battue": "/lovable-uploads/roland-garros.jpg"
  },
  
  // Images de fallback par catégorie
  categoryFallbacks: {
    "sport": "/lovable-uploads/parc-des-princes-night.jpg",
    "indoor": "/lovable-uploads/2a65224f-97c7-457b-a5e7-697fb6fb61f3.png",
    "tennis": "/lovable-uploads/roland-garros.jpg"
  },
  
  // Placeholder par défaut si aucune image n'est disponible
  fallback: "/lovable-uploads/parc-des-princes-night.jpg"
};

/**
 * Obtient l'URL de l'image d'un stade avec fallbacks appropriés
 */
export const getStadiumImageUrl = (
  imageUrl?: string | null, 
  stadiumType?: string | null,
  stadiumName?: string | null
): string => {
  // Si une image est définie, l'utiliser mais avec validation
  if (imageUrl) {
    // Si l'image est dans le système lovable-uploads, vérifier qu'elle existe
    if (imageUrl.includes('lovable-uploads')) {
      // Pour l'instant, utiliser l'image telle quelle et laisser le fallback HTML gérer les erreurs
      return imageUrl;
    }
    return imageUrl;
  }
  
  // Images spécifiques par nom de stade
  const stadiumSpecific = {
    "Parc des Princes": "/lovable-uploads/parc-des-princes-real.jpg",
    "La Défense U Arena": "/lovable-uploads/u-arena-official.jpg",
    "U Arena": "/lovable-uploads/u-arena-official.jpg",
    "Roland-Garros": "/lovable-uploads/roland-garros.jpg",
    "Stade Roland-Garros": "/lovable-uploads/roland-garros.jpg"
  };
  
  if (stadiumName && stadiumSpecific[stadiumName as keyof typeof stadiumSpecific]) {
    return stadiumSpecific[stadiumName as keyof typeof stadiumSpecific];
  }
  
  // Sinon, utiliser l'image par défaut selon le type exact
  if (stadiumType && STADIUM_IMAGES.defaults[stadiumType as keyof typeof STADIUM_IMAGES.defaults]) {
    return STADIUM_IMAGES.defaults[stadiumType as keyof typeof STADIUM_IMAGES.defaults];
  }
  
  // Fallback intelligent basé sur le nom ou type
  if (stadiumName?.toLowerCase().includes('tennis') || stadiumType?.toLowerCase().includes('tennis')) {
    return STADIUM_IMAGES.categoryFallbacks.tennis;
  }
  
  if (stadiumType?.toLowerCase().includes('salle') || stadiumName?.toLowerCase().includes('salle')) {
    return STADIUM_IMAGES.categoryFallbacks.indoor;
  }
  
  // En dernier recours, utiliser l'image de stade générique
  return STADIUM_IMAGES.fallback;
};

/**
 * Attribue automatiquement une image par défaut à un stade selon son type
 */
export const getDefaultImageForStadiumType = (stadiumType?: string | null, stadiumName?: string | null): string => {
  if (!stadiumType && !stadiumName) return STADIUM_IMAGES.fallback;
  
  // Correspondances exactes de type
  if (stadiumType && STADIUM_IMAGES.defaults[stadiumType as keyof typeof STADIUM_IMAGES.defaults]) {
    return STADIUM_IMAGES.defaults[stadiumType as keyof typeof STADIUM_IMAGES.defaults];
  }
  
  // Logique intelligente basée sur le nom et type
  const nameAndType = `${stadiumName || ''} ${stadiumType || ''}`.toLowerCase();
  
  if (nameAndType.includes('tennis') || nameAndType.includes('roland') || nameAndType.includes('garros')) {
    return STADIUM_IMAGES.categoryFallbacks.tennis;
  }
  
  if (nameAndType.includes('salle') || nameAndType.includes('arena') || nameAndType.includes('palais')) {
    return STADIUM_IMAGES.categoryFallbacks.indoor;
  }
  
  // Par défaut pour les stades extérieurs
  return STADIUM_IMAGES.fallback;
};

/**
 * Met à jour l'image d'un stade dans la base de données
 */
export const updateStadiumImage = async (stadiumId: string, imageUrl: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase
    .from('stadiums')
    .update({ image_url: imageUrl })
    .eq('id', stadiumId)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Erreur lors de la mise à jour de l'image: ${error.message}`);
  }
  
  return data;
};

/**
 * Attribue des images par défaut à tous les stades qui n'en ont pas
 */
export const assignDefaultImagesToStadiums = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Récupérer tous les stades sans image
  const { data: stadiums, error: fetchError } = await supabase
    .from('stadiums')
    .select('id, name, type')
    .or('image_url.is.null,image_url.eq.');
    
  if (fetchError) {
    throw new Error(`Erreur lors de la récupération des stades: ${fetchError.message}`);
  }
  
  if (!stadiums || stadiums.length === 0) {
    return { message: "Tous les stades ont déjà une image", updated: 0 };
  }
  
  // Mettre à jour chaque stade individuellement
  const results = [];
  let errors = [];
  
  for (const stadium of stadiums) {
    const defaultImage = getDefaultImageForStadiumType(stadium.type, stadium.name);
    
    const { data, error } = await supabase
      .from('stadiums')
      .update({ image_url: defaultImage })
      .eq('id', stadium.id)
      .select();
      
    if (error) {
      errors.push(`Erreur pour ${stadium.name}: ${error.message}`);
    } else {
      results.push(data[0]);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Erreurs lors de la mise à jour: ${errors.join(', ')}`);
  }
  
  return { 
    message: `${results.length} stade(s) mis à jour avec des images par défaut`, 
    updated: results.length,
    stadiums: results 
  };
};

/**
 * Liste des images disponibles pour les stades
 * Facilite le changement d'images via interface admin
 */
export const AVAILABLE_STADIUM_IMAGES = [
  { name: "Parc des Princes (Réel)", url: "/lovable-uploads/parc-des-princes-real.jpg" },
  { name: "U Arena (Réel)", url: "/lovable-uploads/u-arena-real.jpg" },
  { name: "Parc des Princes (Jour)", url: "/lovable-uploads/parc-des-princes.jpg" },
  { name: "Adidas Arena", url: "/lovable-uploads/adidas-arena.jpg" },
  { name: "Accor Arena", url: "/lovable-uploads/2a65224f-97c7-457b-a5e7-697fb6fb61f3.png" },
  { name: "U Arena", url: "/lovable-uploads/u-arena.jpg" },
  { name: "Marcel Cerdan", url: "/lovable-uploads/marcel-cerdan.jpg" },
  { name: "Pierre de Coubertin (Moderne)", url: "/lovable-uploads/coubertin-modern.jpg" },
  { name: "Pierre de Coubertin", url: "/lovable-uploads/pierre-coubertin.jpg" },
  { name: "Roland-Garros", url: "/lovable-uploads/roland-garros.jpg" },
  { name: "Roland-Garros (Moderne)", url: "/lovable-uploads/roland-garros-modern.jpg" }
];