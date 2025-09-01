-- Changer "Gymnase" en "Salle omnisports" pour le Palais des Sports Marcel Cerdan
UPDATE stadiums SET type = 'Salle omnisports' WHERE type = 'Gymnase';