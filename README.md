# Crxanode Shop Application

This is a web application for managing service orders, including user authentication, order creation, and iPaymu payment integration. The application consists of a React/Vite frontend and a Deno/TypeScript backend, using MySQL as the database.

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Database Setup (MySQL)](#database-setup-mysql)
  - [1. Create MySQL Database](#1-create-mysql-database)
  - [2. Hash Admin Password](#2-hash-admin-password)
  - [3. Run Database Migration](#3-run-database-migration)
- [Backend Setup (Deno)](#backend-setup-deno)
  - [1. Configure Environment Variables](#1-configure-environment-variables)
  - [2. Run the Deno Backend Server](#2-run-the-deno-backend-server)
- [Frontend Setup (React/Vite)](#frontend-setup-reactvite)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Run the Frontend Development Server](#2-run-the-frontend-development-server)
- [Usage](#usage)
- [Important Notes](#important-notes)

## Project Overview

This project has been migrated from a Supabase backend to a custom Deno/TypeScript backend with a MySQL database. It provides:

- User authentication (registration and login).
- User dashboard to create and manage service orders.
- Admin dashboard to view and manage all orders.
- iPaymu payment integration for order deposits and full payments.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (LTS version recommended) and **npm** (comes with Node.js)
- **Deno** (latest stable version recommended)
- **MySQL Server** (e.g., MySQL Community Server, XAMPP, Dockerized MySQL)
- A code editor (e.g., VS Code)

## Database Setup (MySQL)

First, you need to set up your MySQL database and run the migration script.

### 1. Create MySQL Database

Open your MySQL client (e.g., MySQL Workbench, DBeaver, or MySQL command line) and create a new database for your application. Let's name it `shopc_db`.

```sql
CREATE DATABASE shopc_db;
```

### 2. Hash Admin Password

The migration script includes an admin user (`carakawidi07@gmail.com`) but requires a securely hashed password. You **must** replace the placeholder in the `mysql_migration.sql` file with a generated hash.

To generate a bcrypt hash for the password `caraka1717`, use one of the following methods:

- **Using Deno (Recommended):**
  Open your terminal and run:
  ```bash
  deno run --allow-read --allow-write --allow-net https://deno.land/x/bcrypt@v1.0.0/examples/hash.ts caraka1717
  ```
  Copy the outputted hash.

- **Using Node.js (if installed):**
  ```bash
  npm install bcrypt
  node -e "const bcrypt = require('bcrypt'); bcrypt.hash('caraka1717', 10).then(hash => console.log(hash));"
  ```
  Copy the outputted hash.

- **Using Python (if installed):**
  ```bash
  pip install bcrypt
  python -c "import bcrypt; print(bcrypt.hashpw(b'caraka1717', bcrypt.gensalt()).decode('utf-8'))"
  ```
  Copy the outputted hash.

Now, open the file `mysql_migration.sql` located in your project's root directory (`C:\Users\MyBook Hype AMD\Downloads\coding\shop\shopc\mysql_migration.sql`). Find the line:

```sql
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'carakawidi07@gmail.com', 'YOUR_HASHED_PASSWORD_HERE', TRUE);
```

Replace `YOUR_HASHED_PASSWORD_HERE` with the bcrypt hash you just generated.

### 3. Run Database Migration

Navigate to your project's root directory in the terminal:

```bash
cd C:\Users\MyBook Hype AMD\Downloads\coding\shop\shopc
```

Then, execute the migration script using your MySQL client:

```bash
mysql -u your_mysql_username -p shopc_db < mysql_migration.sql
```

- Replace `your_mysql_username` with your MySQL username (e.g., `root`).
- You will be prompted to enter your MySQL password.
- `shopc_db` is the name of the database you created in step 1.

If successful, you will not see any error messages. You can verify by checking the tables (`users`, `orders`, `payments`) in your `shopc_db` database.

## Backend Setup (Deno)

Now, let's set up and run the Deno backend server.

### 1. Configure Environment Variables

Navigate to the `backend` directory:

```bash
cd C:\Users\MyBook Hype AMD\Downloads\coding\shop\shopc\backend
```

Create a new file named `.env` in this directory. Copy the content from `backend/.env.example` into your new `.env` file.

Fill in the variables with your actual credentials:

```
DB_HOST=127.0.0.1
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=shopc_db

IPAYMU_API_KEY=your_ipaymu_api_key
IPAYMU_VA=your_ipaymu_va

JWT_SECRET=your_strong_jwt_secret_key
```

- `your_mysql_username`, `your_mysql_password`, `shopc_db`: Your MySQL database credentials.
- `your_ipaymu_api_key`, `your_ipaymu_va`: Your iPaymu API credentials. You can get these from your iPaymu dashboard.
- `your_strong_jwt_secret_key`: A strong, random secret key for JWT signing. You can use an online JWT secret generator for this.

### 2. Run the Deno Backend Server

While still in the `backend` directory (`C:\Users\MyBook Hype AMD\Downloads\coding\shop\shopc\backend`), run the Deno server:

```bash
deno run --allow-net --allow-env --allow-read --allow-write main.ts
```

- `--allow-net`: Grants network access (for MySQL and iPaymu API calls).
- `--allow-env`: Allows reading environment variables from the `.env` file.
- `--allow-read`: Permits file reading (e.g., for `.env`).
- `--allow-write`: Allows file writing (if any operations require it).
- `--unstable`: Required for certain Deno APIs that are still in development (e.g., `crypto.randomUUID`).

If the server starts successfully, you will see a message in your console like:

```
Server running on http://localhost:8000
```

Keep this terminal window open as the backend server needs to be running for the frontend to function.

## Frontend Setup (React/Vite)

Finally, set up and run the React frontend.

### 1. Install Dependencies

Navigate back to your project's root directory:

```bash
cd C:\Users\MyBook Hype AMD\Downloads\coding\shop\shopc
```

Install the frontend dependencies:

```bash
npm install
```

### 2. Run the Frontend Development Server

Start the Vite development server:

```bash
npm run dev
```

This will typically open your application in your web browser at `http://localhost:5173` (or another available port).

## Usage

With both the backend and frontend servers running:

1.  **Register:** Go to the `/auth` page and register a new user.
2.  **Login:** Log in with your newly registered user or with the admin account (`carakawidi07@gmail.com` and the password you hashed).
3.  **Create Order:** As a regular user, create a new service order from the dashboard.
4.  **Initiate Payment:** Proceed to make a payment (DP or full) for your order. This will interact with the iPaymu API via your Deno backend.
5.  **Admin Actions:** Log in as the admin user to view and manage all orders, update their statuses, and add demo/final links.

## Important Notes

- **Security:** The authentication and admin middleware in the Deno backend (`backend/routes/orders.ts`, `backend/routes/payments.ts`) are currently simplified for demonstration purposes. For a production environment, you **must** implement robust JWT verification and proper role-based access control.
- **iPaymu Sandbox:** The iPaymu integration uses the sandbox environment (`https://sandbox.ipaymu.com`). Remember to switch to the production URL and credentials when deploying to a live environment.
- **Frontend API URL:** The frontend uses `VITE_API_BASE_URL` from `.env` (or defaults to `http://localhost:8000/api`). Ensure this matches your backend's URL when deploying.