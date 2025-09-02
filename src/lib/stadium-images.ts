// Système centralisé de gestion des images de stades
// Permet de gérer facilement les images avec des fallbacks appropriés

const STADIUM_IMAGES = {
  // Images par défaut pour différents types de stades
  defaults: {
    "Stade": "/lovable-uploads/parc-des-princes-night.jpg",
    "Salle omnisports": "/lovable-uploads/adidas-arena.jpg", 
    "Salle polyvalente": "/lovable-uploads/accor-arena.jpg",
    "Arena": "/lovable-uploads/u-arena.jpg"
  },
  
  // Placeholder par défaut si aucune image n'est disponible
  fallback: "/placeholder.svg"
};

/**
 * Obtient l'URL de l'image d'un stade avec fallbacks appropriés
 */
export const getStadiumImageUrl = (
  imageUrl?: string | null, 
  stadiumType?: string | null,
  stadiumName?: string | null
): string => {
  // Si une image est définie, l'utiliser
  if (imageUrl) {
    return imageUrl;
  }
  
  // Sinon, utiliser l'image par défaut selon le type
  if (stadiumType && STADIUM_IMAGES.defaults[stadiumType as keyof typeof STADIUM_IMAGES.defaults]) {
    return STADIUM_IMAGES.defaults[stadiumType as keyof typeof STADIUM_IMAGES.defaults];
  }
  
  // En dernier recours, utiliser le placeholder
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
 * Liste des images disponibles pour les stades
 * Facilite le changement d'images via interface admin
 */
export const AVAILABLE_STADIUM_IMAGES = [
  { name: "Parc des Princes (Nuit)", url: "/lovable-uploads/parc-des-princes-night.jpg" },
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