# GameGrid Server

## Project Description
This is the backend server for GameGrid, a social network for gamers. It handles all server-side logic, data storage, and API endpoints for the client application.

## How to Install

### Requirements
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/gamegrid-server.git
    cd gamegrid-server
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

### Running the Server
1. Start the server using nodemon:
    ```sh
    npm start
    ```

2. The server should now be running on `http://localhost:3001`.

### Linting and Testing
1. Run ESLint:
    ```sh
    npm run lint
    ```

2. Run tests:
    ```sh
    npx cypress run
    ```

## More Explanations About The Project
- The server provides API endpoints for the client application.
- The `/ping` endpoint can be used to check if the server is running.
- The `/about` endpoint returns static content about the project.
