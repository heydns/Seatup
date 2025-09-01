-- Renommer la colonne surface_type en type
ALTER TABLE stadiums RENAME COLUMN surface_type TO type;

-- Mettre à jour les types des stades existants
UPDATE stadiums SET type = 'Salle polyvalente' WHERE name = 'Accor Arena';
UPDATE stadiums SET type = 'Salle polyvalente' WHERE name = 'Adidas Arena';
UPDATE stadiums SET type = 'Salle polyvalente' WHERE name = 'La Défense Arena';
UPDATE stadiums SET type = 'Gymnase' WHERE name = 'Palais des Sports Marcel Cerdan';
UPDATE stadiums SET type = 'Stade' WHERE name = 'Parc des Princes';