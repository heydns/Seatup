-- Créer 15 profils de test avec des user_id simulés
INSERT INTO public.profiles (user_id, email, first_name, last_name, city, postal_code, role, status_badge, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sophie.martin@gmail.com', 'Sophie', 'Martin', 'Paris', '75001', 'beneficiary', 'VIP 🌟', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440002', 'thomas.bernard@gmail.com', 'Thomas', 'Bernard', 'Lyon', '69001', 'beneficiary', 'Fans 🏟️', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440003', 'marie.dubois@gmail.com', 'Marie', 'Dubois', 'Marseille', '13001', 'beneficiary', 'Expert 🎯', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440004', 'pierre.moreau@gmail.com', 'Pierre', 'Moreau', 'Paris', '75015', 'beneficiary', 'Fans 🏟️', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440005', 'claire.laurent@gmail.com', 'Claire', 'Laurent', 'Toulouse', '31000', 'beneficiary', 'VIP 🌟', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440006', 'julien.simon@gmail.com', 'Julien', 'Simon', 'Paris', '75008', 'beneficiary', 'Expert 🎯', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440007', 'emma.leroy@gmail.com', 'Emma', 'Leroy', 'Nice', '06000', 'beneficiary', 'Fans 🏟️', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440008', 'nicolas.michel@gmail.com', 'Nicolas', 'Michel', 'Paris', '75011', 'beneficiary', 'VIP 🌟', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440009', 'camille.garcia@gmail.com', 'Camille', 'Garcia', 'Bordeaux', '33000', 'beneficiary', 'Expert 🎯', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440010', 'antoine.rodriguez@gmail.com', 'Antoine', 'Rodriguez', 'Paris', '75020', 'beneficiary', 'Fans 🏟️', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440011', 'lea.martinez@gmail.com', 'Léa', 'Martinez', 'Lille', '59000', 'beneficiary', 'VIP 🌟', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440012', 'maxime.lopez@gmail.com', 'Maxime', 'Lopez', 'Paris', '75004', 'beneficiary', 'Expert 🎯', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440013', 'sarah.gonzalez@gmail.com', 'Sarah', 'Gonzalez', 'Strasbourg', '67000', 'beneficiary', 'Fans 🏟️', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440014', 'romain.perez@gmail.com', 'Romain', 'Perez', 'Paris', '75017', 'beneficiary', 'VIP 🌟', '/src/assets/marvin-avatar.jpg'),
('550e8400-e29b-41d4-a716-446655440015', 'chloe.sanchez@gmail.com', 'Chloé', 'Sanchez', 'Nantes', '44000', 'beneficiary', 'Expert 🎯', '/src/assets/marvin-avatar.jpg');

-- Créer les relations entre Marvin et les utilisateurs de test
INSERT INTO public.user_relationships (user_id, friend_id, relationship_type) VALUES
-- Relations "collègue" (5 premières personnes)
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440001', 'collègue'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440002', 'collègue'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440003', 'collègue'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440004', 'collègue'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440005', 'collègue'),
-- Relations "ami" (5 suivantes)
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440006', 'ami'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440007', 'ami'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440008', 'ami'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440009', 'ami'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440010', 'ami'),
-- Relations "famille" (5 dernières)
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440011', 'famille'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440012', 'famille'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440013', 'famille'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440014', 'famille'),
('b156d8a6-9612-4e14-a837-087fb44385d9', '550e8400-e29b-41d4-a716-446655440015', 'famille');