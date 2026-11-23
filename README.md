# MediBook Clinic Appointment System

**Video Walkthrough:** (https://youtu.be/zfLCp5Ro5e4)

**GitHub Repository:** (https://github.com/NMordecai/adv-backend-summative-medibook-project)

A RESTful API backend for a clinic appointment booking system built with Node.js, Express.js, MySQL, and Redis.

## Prerequisites
- Node.js (v18+ recommended)
- Docker Desktop (for running MySQL and Redis)
- Postman or Thunder Client (for testing the API)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NMordecai/adv-backend-summative-medibook-projects
   cd adv-backend-summative-medibook-project

2. **Install dependencies:**

   ```bash
   npm install

3. **Start the Databases (Docker):**

   Run these commands to start MySQL (on port 3307 because I was avoiding conflicts) and Redis:

   ```bash
   docker run --name medibook-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=medibook -p 3307:3306 -d mysql:8
   docker run --name medibook-redis -p 6379:6379 -d redis

4. **Load the Database Schema and Seed Data:**

   Wait a few seconds for MySQL to fully boot, then run:

   ```bash
   docker exec -i medibook-mysql mysql -uroot -proot < database/schema.sql
   docker exec -i medibook-mysql mysql -uroot -proot < database/seed.sql

5. **Configure Environment Variables:**

   Create a .env file in the root directory. It should look exactly like this:
   ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=3307
    DB_USER=root
    DB_PASSWORD=root
    DB_NAME=medibook
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
  
6. **Run the Application:**

   You need two terminals running simultaneously.

    Terminal 1 (Web Server):**

    ```bash
    npm start
    ```

    Terminal 2 (Worker Process):**

    Open a second terminal and run:
    ```bash
    node worker.js
        
7. **Run Tests:**

    ```bash
    npm test
## API Endpoints

 ### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create a new patient
- `GET /api/patients/:id` - Get a specific patient
- `PUT /api/patients/:id` - Update a patient
- `DELETE /api/patients/:id` - Delete a patient

### Doctors
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Create a new doctor
- `GET /api/doctors/:id` - Get a specific doctor
- `GET /api/doctors/:id/stats` - Get doctor statistics (revenue, upcoming, 7-day utilization)

### Appointments & Reports
- `POST /api/appointments/book` - Book an appointment
- `DELETE /api/appointments/:id` - Cancel an appointment (triggers refund logic)
- `GET /api/reports/doctors` - Report of all doctors' revenue (includes zero-appointment doctors)
- `GET /api/reports/busy-days` - Report of days >80% booked

### Feedback Page (Part G)
- `GET /feedback` - English feedback form
- `GET /feedback?lang=fr` - French feedback form

## Implementation Decisions & Justifications
### Part C: Concurrency & Double-Booking Prevention
To prevent double-booking (two patients booking the exact same slot at the same millisecond), I used MySQL Transactions (BEGIN, COMMIT, ROLLBACK) and the FOR UPDATE clause in my findSlot SQL query. This locks the specific row while the request is being processed, ensuring that a second simultaneous request will wait and then fail gracefully if the slot is taken.

### Part C: Cancellation & Refunds
Refunds are calculated server-side using a pure utility function (calculateRefund) to ensure the client cannot tamper with the refund amount. The cancellation updates the appointment status to cancelled (keeping the record for history) and records the refund. The database's unique constraint was dropped to allow cancelled slots to be rebooked by others.

### Part D: Audit Log
Using the Node.js fs.promises module, every successful booking and cancellation is appended to logs/audit.log as a JSON line. The fs.mkdir function ensures the directory exists on first run. The logging logic is wrapped in a try/catch block so that if the file system fails, the user's HTTP request still succeeds (non-blocking).

### Part E: Waitlist Queue (Redis)
If a user tries to book a fully booked slot, they are pushed to a Redis list (queue). A separate worker process (worker.js) runs independently of the web server, polling the queue every 5 seconds. When a cancellation occurs, the worker pops the first patient and books them into the freed slot. If the promotion fails (e.g., someone else grabbed the slot), the patient is safely pushed back onto the queue so they are never lost. Additionally, every confirmed appointment enqueues a notification job that the worker processes to the audit log.
