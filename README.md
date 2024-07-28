# book-project
Role Based Authenticated Book Management System

A Node.js and Express.js based API for managing books with role-based authentication and authorization. The API allows users to perform CRUD operations on books based on their roles (Admin, Author, Reader).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Authentication](#authentication)
- [Swagger Documentation](#swagger-documentation)
- [Environment Variables](#environment-variables)
- [License](#license)

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
    PRODUCTION_URL=https://book-project-kfdqk5tby-shivam-jains-projects-11466454.vercel.app/api/v1
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
