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
    Create a `.env` file in the root directory and add the following:
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

Auth
POST /api/auth/register: Register a new user
POST /api/auth/login: Login a user and obtain a JWT token
Books
POST /api/books: Add a new book (Admin, Author)
GET /api/books: Get all books (Admin, Author, Reader)
GET /api/books/{id}: Get a book by ID (Admin, Author, Reader)
PUT /api/books/{id}: Update a book (Admin, Author)
DELETE /api/books/{id}: Delete a book (Admin)

## Swagger Documentation

Swagger is used for API documentation. Once the server is running, you can access the Swagger UI at:
```bash
https://book-project-b97u.onrender.com/api-docs/
```

