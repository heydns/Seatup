-- Update status badges: VIP to Ultra, Expert to Débutant
UPDATE team_members 
SET status_badge = 'Ultra 🌟'
WHERE status_badge LIKE '%VIP%';

UPDATE team_members 
SET status_badge = 'Débutant 🎯'
WHERE status_badge LIKE '%Expert%';