# Backend (Railway)
- Team: Backend
- Stack: Node.js + Express/Fastify/Nest (choose one)
- Start: `pnpm dev` (or `npm run dev`)
- Health: GET /health → 200



# OVERALL Structure 
- The backend will be split up into 
- index.js - starts the server
- config/ - database connections,settings
- routes/ - define all urls
- controllers/ - buisness logic, seperated from the routes to keep it clean and organized in seperate folder
- middleware/ - security checks, reusing auth checks across the different routes
- utils/ - helper functions,