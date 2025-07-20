import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    preferredDate: "",
    preferredTime: "",
    subject: "",
    message: ""
  });
  
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation d'envoi du formulaire
    toast({
      title: "Demande envoyée !",
      description: "Nous vous contacterons dans les plus brefs délais.",
    });
    
    // Reset du formulaire
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      preferredDate: "",
      preferredTime: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="vintage-grain absolute inset-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-monument font-bold mb-6 animate-fade-up">
              <span className="text-brand">Contactez-nous</span>
            </h1>
            
            <p className="text-base md:text-lg text-foreground mb-8 font-medium animate-fade-up" style={{
              animationDelay: '0.2s'
            }}>
              Prenez rendez-vous avec notre équipe pour découvrir comment Seatup peut transformer l'expérience sportive de vos salariés.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl md:text-3xl font-monument mb-6">
                  Parlons de votre projet
                </h2>
                <p className="text-base text-muted-foreground mb-8">
                  Notre équipe d'experts est là pour vous accompagner dans la mise en place d'une solution billetterie adaptée à votre entreprise.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-monument text-lg mb-2">Téléphone</h3>
                    <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-monument text-lg mb-2">Email</h3>
                    <p className="text-muted-foreground">contact@seatup.co</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-monument text-lg mb-2">Adresse</h3>
                    <p className="text-muted-foreground">
                      123 Avenue des Champs-Élysées<br />
                      75008 Paris, France
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-sport p-6">
                <h3 className="font-monument text-lg mb-4">Pourquoi choisir Seatup ?</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Interface simple et intuitive</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Intégration CSE simplifiée</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Support dédié</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Catalogue d'événements riche</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="card-sport">
              <CardHeader>
                <CardTitle className="font-monument text-xl">
                  Prenez rendez-vous
                </CardTitle>
                <CardDescription>
                  Remplissez ce formulaire et nous vous contacterons rapidement pour organiser une présentation personnalisée.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                        className="search-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      required
                      className="search-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Date souhaitée</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Horaire souhaité</Label>
                      <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange("preferredTime", value)}>
                        <SelectTrigger className="search-input">
                          <SelectValue placeholder="Choisir un créneau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09h00-10h00">09h00 - 10h00</SelectItem>
                          <SelectItem value="10h00-11h00">10h00 - 11h00</SelectItem>
                          <SelectItem value="11h00-12h00">11h00 - 12h00</SelectItem>
                          <SelectItem value="14h00-15h00">14h00 - 15h00</SelectItem>
                          <SelectItem value="15h00-16h00">15h00 - 16h00</SelectItem>
                          <SelectItem value="16h00-17h00">16h00 - 17h00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet de votre demande</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger className="search-input">
                        <SelectValue placeholder="Sélectionner un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demande de démonstration</SelectItem>
                        <SelectItem value="pricing">Information tarifaire</SelectItem>
                        <SelectItem value="integration">Intégration CSE</SelectItem>
                        <SelectItem value="partnership">Partenariat</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez-nous votre projet, vos besoins spécifiques, le nombre de salariés concernés..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className="search-input min-h-24"
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Prendre rendez-vous
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}