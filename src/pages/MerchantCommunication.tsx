import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Package, Shirt, Loader2, Trash2, Check, Euro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

/**
 * MerchantCommunication — Prio 3 Marchand : Enrichissement offre
 * ─────────────────────────────────────────────────────────────────────────
 * 2 tabs :
 *  - Produits : CRUD merchandising (nom, cat, prix, stock, visuel)
 *  - Packages : bundles event + produits + prix total
 */

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  event_id: string | null;
  total_price: number;
  image_url: string | null;
  is_active: boolean;
}

interface EventOpt { id: string; title: string; }

const CATEGORIES = ['maillot', 'ecarpe', 'goodies', 'accessoire', 'autre'];

const MerchantCommunication = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const organizerId = (userProfile as any)?.organizer_id;

  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [events, setEvents] = useState<EventOpt[]>([]);
  const [loading, setLoading] = useState(true);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAll = async () => {
    if (!organizerId) return;
    setLoading(true);
    const [{ data: prods }, { data: packs }, { data: evs }] = await Promise.all([
      supabase.from('products').select('*').eq('organizer_id', organizerId).order('created_at', { ascending: false }),
      supabase.from('packages').select('*').eq('organizer_id', organizerId).order('created_at', { ascending: false }),
      supabase.from('events').select('id, title').eq('organizer_id', organizerId).eq('is_published', true),
    ]);
    setProducts((prods as Product[]) ?? []);
    setPackages((packs as Package[]) ?? []);
    setEvents((evs as EventOpt[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [organizerId]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    setIsDeleting(false);
    if (error) toast.error(`Erreur : ${error.message}`);
    else {
      toast.success('Produit supprimé');
      setProductToDelete(null);
      loadAll();
    }
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('packages').delete().eq('id', packageToDelete.id);
    setIsDeleting(false);
    if (error) toast.error(`Erreur : ${error.message}`);
    else {
      toast.success('Package supprimé');
      setPackageToDelete(null);
      loadAll();
    }
  };

  if (!organizerId) return <div className="p-8 text-center text-muted-foreground">Non autorisé</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-monument text-brand">Enrichissement de l'offre</h1>
              <p className="text-sm text-muted-foreground">
                Ajoutez du merchandising et créez des packages billets + produits
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="products"><Shirt className="h-4 w-4 mr-2" /> Produits ({products.length})</TabsTrigger>
            <TabsTrigger value="packages"><Package className="h-4 w-4 mr-2" /> Packages ({packages.length})</TabsTrigger>
          </TabsList>

          {/* ═══ TAB PRODUITS ═══ */}
          <TabsContent value="products" className="space-y-4 pt-6">
            <div className="flex justify-end">
              <Button variant="hero" onClick={() => setProductModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter un produit
              </Button>
            </div>

            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            ) : products.length === 0 ? (
              <Card className="card-sport">
                <CardContent className="py-12 text-center">
                  <Shirt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">Aucun produit pour le moment. Créez votre premier merch avec le bouton ci-dessus.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <Card key={p.id} className="card-sport">
                    <div className="aspect-video overflow-hidden rounded-t-xl bg-muted">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Shirt className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{p.category}</Badge>
                        <span className="text-xl font-monument text-brand">{p.price}€</span>
                      </div>
                      <h3 className="font-semibold mb-1">{p.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Stock : {p.stock}</span>
                        <Button variant="ghost" size="sm" onClick={() => setProductToDelete(p)} className="text-muted-foreground hover:text-destructive gap-1 h-7">
                          <Trash2 className="h-3 w-3" /> Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB PACKAGES ═══ */}
          <TabsContent value="packages" className="space-y-4 pt-6">
            <div className="flex justify-end">
              <Button variant="hero" onClick={() => setPackageModalOpen(true)} className="gap-2" disabled={products.length === 0}>
                <Plus className="h-4 w-4" /> Créer un package
              </Button>
            </div>

            {products.length === 0 && (
              <Card>
                <CardContent className="py-6 text-center text-sm text-amber-800 bg-amber-50 rounded-lg">
                  ⚠️ Vous devez d'abord créer des produits avant de pouvoir créer un package.
                </CardContent>
              </Card>
            )}

            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            ) : packages.length === 0 ? (
              <Card className="card-sport">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">Aucun package. Créez des combinaisons billets + produits pour augmenter votre panier moyen.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pack) => {
                  const ev = events.find((e) => e.id === pack.event_id);
                  return (
                    <Card key={pack.id} className="card-sport">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2 bg-gradient-primary text-white">Pack Avantage</Badge>
                            <CardTitle className="font-monument text-brand text-lg">{pack.name}</CardTitle>
                            {ev && <CardDescription>Associé à : {ev.title}</CardDescription>}
                          </div>
                          <span className="text-2xl font-monument text-brand">{pack.total_price}€</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{pack.description}</p>
                        <Button variant="ghost" size="sm" onClick={() => setPackageToDelete(pack)} className="text-muted-foreground hover:text-destructive gap-1 h-7">
                          <Trash2 className="h-3 w-3" /> Supprimer
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ProductFormModal open={productModalOpen} onOpenChange={setProductModalOpen} organizerId={organizerId} onSuccess={loadAll} />
      <PackageFormModal open={packageModalOpen} onOpenChange={setPackageModalOpen} organizerId={organizerId} events={events} products={products} onSuccess={loadAll} />

      <ConfirmDeleteModal
        open={productToDelete !== null}
        onOpenChange={(o) => !o && setProductToDelete(null)}
        title="Supprimer ce produit ?"
        description={<>Cette action est <strong>irréversible</strong>. Les packages qui utilisent ce produit peuvent être impactés.</>}
        onConfirm={handleDeleteProduct}
        isLoading={isDeleting}
      />
      <ConfirmDeleteModal
        open={packageToDelete !== null}
        onOpenChange={(o) => !o && setPackageToDelete(null)}
        title="Supprimer ce package ?"
        description={<>Cette action est <strong>irréversible</strong>.</>}
        onConfirm={handleDeletePackage}
        isLoading={isDeleting}
      />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// ProductFormModal — Ajout produit
// ══════════════════════════════════════════════════════════════════
function ProductFormModal({ open, onOpenChange, organizerId, onSuccess }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('goodies');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = name.trim() && parseFloat(price) > 0 && parseInt(stock) >= 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    const { error } = await supabase.from('products').insert({
      organizer_id: organizerId,
      name: name.trim(),
      description: description.trim() || null,
      category,
      price: parseInt(price),
      stock: parseInt(stock),
      image_url: imageUrl.trim() || null,
    });
    setIsLoading(false);
    if (error) toast.error(`Erreur : ${error.message}`);
    else {
      toast.success('Produit ajouté au catalogue');
      setName(''); setDescription(''); setCategory('goodies'); setPrice(''); setStock(''); setImageUrl('');
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-monument">Ajouter un produit</DialogTitle>
          <DialogDescription>Créez un nouvel élément de merchandising.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nom du produit <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Maillot Domicile 25/26" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prix TTC <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="35" className="pr-8" />
                <Euro className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Stock disponible <span className="text-destructive">*</span></Label>
            <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="50" />
          </div>
          <div className="space-y-2">
            <Label>URL image (optionnel)</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Détails du produit..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
          <Button variant="hero" onClick={handleSubmit} disabled={!canSubmit || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Ajouter au catalogue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// PackageFormModal — Création package
// ══════════════════════════════════════════════════════════════════
function PackageFormModal({ open, onOpenChange, organizerId, events, products, onSuccess }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
  const [totalPrice, setTotalPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCount = Object.values(selectedProducts).reduce((s, v) => s + v, 0);
  const suggestedPrice = Object.entries(selectedProducts).reduce((s, [pid, qty]) => {
    const p = products.find((x: Product) => x.id === pid);
    return s + (p ? p.price * qty : 0);
  }, 0);

  const canSubmit = name.trim() && parseFloat(totalPrice) > 0 && selectedCount > 0;

  const toggleProduct = (pid: string) => {
    setSelectedProducts((prev) => {
      const copy = { ...prev };
      if (copy[pid]) delete copy[pid];
      else copy[pid] = 1;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    const { data: pack, error: pkErr } = await supabase.from('packages').insert({
      organizer_id: organizerId,
      event_id: eventId || null,
      name: name.trim(),
      description: description.trim() || null,
      total_price: parseInt(totalPrice),
    }).select().single();

    if (pkErr) { setIsLoading(false); return toast.error(`Erreur : ${pkErr.message}`); }

    // Insert package_items
    const items = Object.entries(selectedProducts).map(([product_id, quantity]) => ({
      package_id: pack.id,
      product_id,
      quantity,
    }));
    const { error: itemsErr } = await supabase.from('package_items').insert(items);
    setIsLoading(false);

    if (itemsErr) return toast.error(`Package créé mais items en erreur : ${itemsErr.message}`);
    toast.success('Package créé avec succès et ajouté au catalogue.');
    setName(''); setDescription(''); setEventId(''); setSelectedProducts({}); setTotalPrice('');
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-monument">Créer un package</DialogTitle>
          <DialogDescription>Combinez billets + produits pour dynamiser vos ventes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nom du package <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Pack Supporter PSG vs OM" />
          </div>

          <div className="space-y-2">
            <Label>Événement associé (optionnel)</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger><SelectValue placeholder="Aucun (package indépendant)" /></SelectTrigger>
              <SelectContent>
                {events.map((e: EventOpt) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Produits inclus <span className="text-destructive">*</span></Label>
            <div className="space-y-1 max-h-52 overflow-y-auto border rounded-lg p-2">
              {products.map((p: Product) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-sm transition-all ${
                    selectedProducts[p.id]
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.price}€</p>
                  </div>
                  {selectedProducts[p.id] && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prix total du package <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input type="number" min="1" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder={suggestedPrice > 0 ? String(Math.round(suggestedPrice * 0.9)) : '99'} className="pr-8" />
              <Euro className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>
            {suggestedPrice > 0 && totalPrice && parseInt(totalPrice) < suggestedPrice && (
              <p className="text-xs text-green-600">💡 Réduction : {Math.round((1 - parseInt(totalPrice) / suggestedPrice) * 100)}% vs achat séparé ({suggestedPrice}€)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Décrivez le contenu du package..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
          <Button variant="hero" onClick={handleSubmit} disabled={!canSubmit || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Créer le package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MerchantCommunication;
