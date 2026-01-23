-- Migrate existing STUDENT roles to USER
UPDATE "user_roles" SET role = 'USER' WHERE role = 'STUDENT';
