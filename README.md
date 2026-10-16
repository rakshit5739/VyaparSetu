# VyaparSetu — Local Procurement Made Simple

VyaparSetu is a MERN-stack platform that connects customers with local shopkeepers for bulk material purchasing. Customers submit their material requirements, shopkeepers provide quotations, and customers compare offers before making purchasing decisions.

The goal is to save time, improve price transparency, and support local businesses.

## Features

- Customer and shopkeeper registration and login
- Role-based access and protected routes
- Material requirement submission
- Shopkeeper quotation management
- Quotation comparison
- Order management
- Shop and product browsing

## Technology Stack

- **Frontend:** React.js, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** MongoDB, Mongoose
- **Tools:** Git, GitHub, npm, Visual Studio Code

## How It Works

1. Customers submit a list of required materials.
2. Relevant shopkeepers review the requirements.
3. Shopkeepers submit quotations.
4. Customers compare offers and select a suitable quotation.
5. The selected quotation proceeds through the order workflow.

## Project Structure

- `backend/` — Server, database configuration, models, controllers, routes, and middleware.
- `frontend/` — React pages, components, authentication context, and API services.

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB or MongoDB Atlas
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/rakshit5739/VyaparSetu.git
cd VyaparSetu
```

Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Configure the required environment variables for the backend and frontend. Use the variable names expected by the application, and never commit credentials or secret keys.

Start the application:

```bash
npm run dev
```

The root development script starts the frontend and backend together when the dependencies and environment variables are configured.

## Author

**Rakshit Bhardwaj**

GitHub: [rakshit5739](https://github.com/rakshit5739)

## License

No open-source license has been specified yet.