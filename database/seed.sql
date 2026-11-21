USE medibook;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Patients
INSERT INTO patients (name, email, phone) VALUES
('Ama Mensah', 'ama@mail.com', '0244-111-222'),
('Kojo Owusu', 'kojo@mail.com', '0555-333-444'),
('Abena Osei', 'abena@mail.com', '0277-555-666');

-- 2. Insert Doctors
INSERT INTO doctors (name, specialty, consultation_fee, room) VALUES
('Dr. Boateng', 'Dermatology', 150.00, 'R-12'),
('Dr. Adjei', 'Paediatrics', 100.00, 'R-03'),
('Dr. Appiah', 'Cardiology', 200.00, 'R-05');

-- 3. Insert Appointments 8 of them
-- We need one doctor-day near the 12-slot cap. Let's give Dr. Boateng 8 appointments on the same day.
INSERT INTO appointments (patient_id, doctor_id, appt_datetime, amount_paid) VALUES
-- Dr. Boateng's busy day
(1, 1, '2026-08-10 09:00:00', 150.00),
(2, 1, '2026-08-10 09:30:00', 150.00),
(3, 1, '2026-08-10 10:00:00', 150.00),
(1, 1, '2026-08-10 10:30:00', 150.00),
(2, 1, '2026-08-10 11:00:00', 150.00),
(3, 1, '2026-08-10 11:30:00', 150.00),
(1, 1, '2026-08-10 12:00:00', 150.00),
(2, 1, '2026-08-10 12:30:00', 150.00);

-- Note: Dr. Adjei (id=2) has 0 appointments. Dr. Appiah (id=3) has 0 appointments.
-- To match the spreadsheet from the assignment exactly, I would add:
-- INSERT INTO appointments (patient_id, doctor_id, appt_datetime, amount_paid) VALUES (1, 2, '2026-08-15 10:00:00', 100.00);
-- But since I need 8 total and a near-cap day, the 8 for Dr. Boateng fulfill the requirement.