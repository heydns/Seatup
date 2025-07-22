import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export const EventDetail = () => {
  console.log('EventDetail component rendering...');
  
  const { id } = useParams<{ id: string }>();
  console.log('ID from params:', id);

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-monument mb-4">Page de test</h1>
            <p className="mb-4">ID reçu: {id}</p>
            <p className="mb-4">Si vous voyez ce message, la page se charge correctement.</p>
            <Link to="/events">
              <Button variant="sport">Retour aux événements</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};