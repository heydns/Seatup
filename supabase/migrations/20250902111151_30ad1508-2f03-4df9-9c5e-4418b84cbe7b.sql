-- Modifier le type de U Arena de "Pelouse synthétique" à "Salle polyvalente"
UPDATE stadiums 
SET type = 'Salle polyvalente', updated_at = now()
WHERE id = '07ca9e2e-b0a3-4ea5-961c-efd6560492f0';