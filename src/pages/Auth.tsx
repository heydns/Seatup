import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'beneficiary',
    companyName: ''
  });

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Login error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect');
          } else {
            toast.error(`Erreur de connexion: ${error.message}`);
          }
        } else {
          toast.success('Connexion réussie !');
          navigate('/home');
        }
      } else {
        // Validation des champs obligatoires
        if (!formData.firstName.trim()) {
          toast.error('Le prénom est requis');
          return;
        }
        if (!formData.lastName.trim()) {
          toast.error('Le nom est requis');
          return;
        }
        if ((formData.role === 'cse_admin' || formData.role === 'organizer_admin') && !formData.companyName.trim()) {
          toast.error(`Le nom de ${formData.role === 'cse_admin' ? 'l\'entreprise' : 'l\'organisation'} est requis`);
          return;
        }

        const { error, data } = await signUp(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName, 
          formData.role,
          formData.companyName
        );
        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('User already registered')) {
            toast.error('Un compte existe déjà avec cette adresse email');
          } else if (error.message.includes('Password should be at least')) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
          } else {
            toast.error(`Erreur d'inscription: ${error.message}`);
          }
        } else {
          if (data?.user?.email_confirmed_at) {
            toast.success('Inscription réussie ! Connexion en cours...');
          } else {
            toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Une erreur technique est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Connexion' : 'Inscription'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Connectez-vous à votre compte' 
                : 'Créez votre compte pour accéder à votre espace'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required={!isLogin}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required={!isLogin}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Type de compte</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beneficiary">Bénéficiaire (Salarié CSE)</SelectItem>
                        <SelectItem value="cse_admin">Administrateur CSE</SelectItem>
                        <SelectItem value="organizer_admin">Organisateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.role === 'cse_admin' || formData.role === 'organizer_admin') && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        {formData.role === 'cse_admin' ? 'Nom de l\'entreprise' : 'Nom de l\'organisation'} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        required={formData.role === 'cse_admin' || formData.role === 'organizer_admin'}
                        placeholder={formData.role === 'cse_admin' ? 'Nom de votre entreprise' : 'Nom de votre organisation'}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Se connecter' : 'S\'inscrire'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin
                  ? "Pas de compte ? S'inscrire"
                  : 'Déjà un compte ? Se connecter'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;