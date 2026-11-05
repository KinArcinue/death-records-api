# Death Records Management API

A REST API for managing death records using Node.js, Express.js, and SQLite.

## Features

- User registration
- User login
- Password hashing using bcrypt
- JWT authentication
- Protected death records endpoints
- Create, read, update, and delete death records (CRUD)

## Technologies Used

- Node.js
- Express.js
- SQLite
- better-sqlite3
- JSON Web Token (JWT)
- bcryptjs
- Postman

## Installation

1. Clone the repository:

   git clone https://github.com/KinArcinue/death-records-api.git

2. Open the project folder:

   cd death-records-api

3. Install dependencies:

   npm install

4. Create a `.env` file in the project folder.

5. Add your JWT secret:

   JWT_SECRET=your_own_secret_here

6. Start the server:

   node server.js

The API runs at:

http://localhost:3000

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/register | Register a user |
| POST | /api/login | Login and receive JWT |

### Death Records

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/death-records | Get all records |
| GET | /api/death-records/:id | Get one record |
| POST | /api/death-records | Create a record |
| PUT | /api/death-records/:id | Update a record |
| DELETE | /api/death-records/:id | Delete a record |

All death records endpoints require JWT authentication.

## Authentication

1. Register an account using `/api/register`.
2. Login using `/api/login`.
3. Copy the returned JWT token.
4. In Postman, select Authorization.
5. Choose Bearer Token and paste your token.
6. Send requests to the death records endpoints.

## Sample Registration Body

{
  "username": "admin",
  "password": "admin12345"
}

## Sample Death Record Body

{
  "full_name": "Juan Dela Cruz",
  "date_of_death": "2026-01-15",
  "place_of_death": "Naga City"
}

## Developers

Death Records Management API Project
