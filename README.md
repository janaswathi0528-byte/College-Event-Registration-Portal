# Intercollege Event Management (Node.js + SQL Server + Jenkins)

A modern, animated web app that brings the manual process of intercollege event management online.
Built with **Node.js (Express)**, **EJS** templates, **SQL Server** (via `mssql`), and delightful
animations using CSS and a little JS. Includes a **Jenkinsfile** for CI and clear GitHub run steps.

## Features (Admin • Teacher • Student)

- **Admin**: Register College, Create Events (Indoor/Outdoor), Add Teachers, View Student Registrations, View Events, View Results
- **Teacher**: Event Attendance, View Students & mark Round Winners, Generate Results, View Standings
- **Student**: Register/Login, View Events, Register for Events, Mock Payment, View Registered Events

## Quick Start (Local)

1. **Clone** the repo (or extract the ZIP you downloaded):  
   ```bash
   git clone https://github.com/your-username/intercollege-event-management.git
   cd intercollege-event-management
   ```

2. **Install deps**  
   ```bash
   npm install
   ```

3. **Create database** and seed data
   - Ensure SQL Server is running and accessible
   - Create a DB called `intercollege` (or change name in `.env`)
   - Run the schema:
     ```bash
     # On Windows, use sqlcmd; on Linux/macOS with sqlcmd or Azure Data Studio
     # Example with sqlcmd:
     sqlcmd -S localhost -U sa -P YourStrong!Passw0rd -d master -i db/schema.sql
     sqlcmd -S localhost -U sa -P YourStrong!Passw0rd -d intercollege -i db/seed.sql
     ```
   - Alternatively, set `.env` then run:
     ```bash
     npm run db:seed
     ```

4. **Configure environment**  
   ```bash
   cp .env.example .env
   # edit .env to match your SQL Server settings
   ```

5. **Run**  
   ```bash
   npm run dev
   # open http://localhost:3000
   ```

### Default Users (from seed)
- **Admin**:    admin@demo.edu / Passw0rd!
- **Teacher**:  teacher@demo.edu / Passw0rd!
- **Student**:  student@demo.edu / Passw0rd!

> Change these after first login.

## GitHub Steps (Easy)
1. Create a **new GitHub repo** (public or private).
2. On your machine:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Intercollege Event Management"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In GitHub, add **Secrets** (if deploying) for DB credentials or use a secure `.env` on your server/runner.

## Jenkins CI
- Use the `Jenkinsfile` in the repo.
- Pipeline stages: **Checkout → Install → Lint → Seed (optional) → Test (placeholder) → Build (N/A) → Archive**.
- Add **Jenkins credentials** for Git (if private) and environment variables for DB if you run seeding from CI.

### Minimal Jenkins Setup
1. Install Jenkins + Node.js plugin (or use nvm in shell).
2. Create a Pipeline job pointing to your GitHub repo URL.
3. Add a credential for Git if private.
4. Trigger builds on push using a GitHub webhook.

## SQL Server Notes
- For local dev on Windows, SQL Server Express is fine.
- On Linux/macOS, use **SQL Server in Docker**:
  ```bash
  docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourStrong!Passw0rd' -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
  ```
  Then run the schema and seed scripts as shown above.

## Project Structure
```
.
├─ server.js
├─ package.json
├─ .env.example
├─ Jenkinsfile
├─ README.md
├─ config/
│  └─ db.js
├─ middleware/
│  └─ auth.js
├─ routes/
│  ├─ auth.js
│  ├─ admin.js
│  ├─ teacher.js
│  └─ student.js
├─ views/
│  ├─ layout.ejs
│  ├─ partials/
│  │  ├─ nav.ejs
│  │  └─ flash.ejs
│  ├─ index.ejs
│  ├─ auth/
│  │  ├─ login.ejs
│  │  └─ register.ejs
│  ├─ admin/
│  │  ├─ dashboard.ejs
│  │  ├─ colleges_new.ejs
│  │  ├─ events_new.ejs
│  │  ├─ events_list.ejs
│  │  ├─ registrations.ejs
│  │  └─ results.ejs
│  ├─ teacher/
│  │  ├─ dashboard.ejs
│  │  ├─ events_list.ejs
│  │  ├─ attendance.ejs
│  │  └─ winners.ejs
│  └─ student/
│     ├─ dashboard.ejs
│     ├─ events_list.ejs
│     └─ registrations.ejs
├─ public/
│  ├─ css/styles.css
│  └─ js/animations.js
├─ db/
│  ├─ schema.sql
│  └─ seed.sql
└─ tools/
   └─ seed.js
```

## Animations & UI
- Smooth page transitions, fade/slide-in sections, animated cards & buttons.
- Mobile-first responsive design.

## License
MIT
