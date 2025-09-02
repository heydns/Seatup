import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Image, Upload } from "lucide-react";
import { AVAILABLE_STADIUM_IMAGES, updateStadiumImage } from "@/lib/stadium-images";
import { useToast } from "@/hooks/use-toast";

interface Stadium {
  id: string;
  name: string;
  image_url?: string | null;
  type?: string | null;
}

interface StadiumImageSelectorProps {
  stadium: Stadium;
  onImageUpdated?: (newImageUrl: string) => void;
}

export const StadiumImageSelector = ({ stadium, onImageUpdated }: StadiumImageSelectorProps) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState(stadium.image_url || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleImageUpdate = async () => {
    if (!selectedImageUrl) return;

    setIsUpdating(true);
    try {
      await updateStadiumImage(stadium.id, selectedImageUrl);
      
      toast({
        title: "Succès",
        description: `Image mise à jour pour ${stadium.name}`,
      });

      onImageUpdated?.(selectedImageUrl);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'image",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentImage = AVAILABLE_STADIUM_IMAGES.find(img => img.url === stadium.image_url);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image du stade - {stadium.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image actuelle */}
        <div>
          <p className="text-sm font-medium mb-2">Image actuelle :</p>
          {stadium.image_url ? (
            <div className="space-y-2">
              <div className="relative h-32 w-full rounded-lg overflow-hidden">
                <img 
                  src={stadium.image_url} 
                  alt={stadium.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {currentImage && (
                <Badge variant="outline">{currentImage.name}</Badge>
              )}
            </div>
          ) : (
            <div className="h-32 w-full rounded-lg bg-muted flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Aucune image définie</p>
            </div>
          )}
        </div>

        {/* Sélecteur d'image */}
        <div>
          <p className="text-sm font-medium mb-2">Changer l'image :</p>
          <Select value={selectedImageUrl} onValueChange={setSelectedImageUrl}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une image..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucune image</SelectItem>
              {AVAILABLE_STADIUM_IMAGES.map((image) => (
                <SelectItem key={image.url} value={image.url}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 rounded overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.name}
                    {image.url === stadium.image_url && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview de la nouvelle image */}
        {selectedImageUrl && selectedImageUrl !== stadium.image_url && (
          <div>
            <p className="text-sm font-medium mb-2">Aperçu :</p>
            <div className="relative h-32 w-full rounded-lg overflow-hidden">
              <img 
                src={selectedImageUrl} 
                alt="Aperçu"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleImageUpdate}
            disabled={!selectedImageUrl || selectedImageUrl === stadium.image_url || isUpdating}
            className="flex-1"
          >
            {isUpdating ? "Mise à jour..." : "Appliquer l'image"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedImageUrl(stadium.image_url || '')}
            disabled={selectedImageUrl === stadium.image_url}
          >
            Annuler
          </Button>
        </div>

        {/* Instruction pour ajouter de nouvelles images */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1 font-medium">
            💡 Pour ajouter de nouvelles images :
          </p>
          <ol className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>1. Uploadez l'image dans public/lovable-uploads/</li>
            <li>2. Ajoutez-la dans AVAILABLE_STADIUM_IMAGES</li>
            <li>3. Elle apparaîtra dans cette liste</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};