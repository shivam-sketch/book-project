# book-project
Role Based Authenticated Book Management System

A Node.js and Express.js based API for managing books with role-based authentication and authorization. The API allows users to perform CRUD operations on books based on their roles (Admin, Author, Reader).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Swagger Documentation](#swagger-documentation)


## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/book-project.git
    cd book-project
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the following or copy the contents of .env_local file :
    ```env
    PRODUCTION_URL=https://book-project-b97u.onrender.com/api/v1/
    PORT=3000
    JWT_SECRET=BOOKAUTHORREADER
    MONGODB_URI=mongodb+srv://test_project:ShivamDB2601@cluster0.3nfqkym.mongodb.net/books?retryWrites=true&w=majority&appName=Cluster0

    ```

4. Run the application:
    ```bash
    npm start
    ```

## Usage

### Running the Server

To start the server, run:
```bash
npm start
```

## Endpoints
```bash
Auth
POST /api/v1/auth/register: Register a new user
POST /api/v1/auth/login: Login a user and obtain a JWT token
Books
POST /api/v1/book: Add a new book (Admin, Author)
GET /api/v1/book: Get all books (Admin, Author, Reader)
PUT /api/v1/book/: Update a book (Admin, Author)
DELETE /api/v1/book/: Delete a book (Admin)
```

## Swagger Documentation

Swagger is used for API documentation. Once the server is running, you can access the Swagger UI at:
```bash
http://localhost:3000/api-docs
or at Live URL
https://book-project-b97u.onrender.com/api-docs/
```

