import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Play, CheckCircle, AlertTriangle } from "lucide-react";
import { assignDefaultImagesToStadiums } from "@/lib/stadium-images";
import { useToast } from "@/hooks/use-toast";

export const AssignDefaultImages = () => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [result, setResult] = useState<{ 
    message: string; 
    updated: number; 
    stadiums?: any[] 
  } | null>(null);
  const { toast } = useToast();

  const handleAssignImages = async () => {
    setIsAssigning(true);
    setResult(null);

    try {
      const assignmentResult = await assignDefaultImagesToStadiums();
      setResult(assignmentResult);
      
      toast({
        title: "Succès",
        description: assignmentResult.message,
      });
    } catch (error) {
      console.error('Erreur lors de l\'attribution des images:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'attribuer les images par défaut",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Attribution d'images par défaut
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            Cette action va attribuer automatiquement des images par défaut à tous les stades 
            qui n'en ont pas encore, basée sur leur type :
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li><strong>Stade</strong> → Image de stade extérieur</li>
            <li><strong>Salle omnisports/polyvalente</strong> → Image de salle indoor</li>
            <li><strong>Courts de tennis</strong> → Image de Roland-Garros</li>
            <li><strong>Arena</strong> → Image d'arena moderne</li>
          </ul>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleAssignImages}
          disabled={isAssigning}
          className="w-full"
          size="lg"
        >
          {isAssigning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Attribution en cours...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Attribuer les images par défaut
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            {result.updated > 0 ? (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Attribution réussie !
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.message}
                  </p>
                  {result.stadiums && result.stadiums.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {result.stadiums.slice(0, 5).map((stadium, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {stadium.name}
                        </Badge>
                      ))}
                      {result.stadiums.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.stadiums.length - 5} autres
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Aucune action nécessaire
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border-l-4 border-blue-200">
          <p className="font-medium mb-1">💡 À savoir :</p>
          <ul className="space-y-1">
            <li>• Cette action ne modifie que les stades sans image</li>
            <li>• Les images existantes ne seront pas écrasées</li>
            <li>• Vous pourrez toujours changer les images individuellement après</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};