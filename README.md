# AuthMS

Authentication Microservice using Node.js, Express, MongoDB, and JWT.

### Controller, service repository design pattern

**Controller layer (auth.routes.js):** Handles the routing logic and calls appropriate service methods.

**Service layer (auth.service.js, for example):** Contains business logic and orchestrates calls to the repository.

**Repository layer (auth.repository.js, for example):** Handles all data access logic (e.g., queries to a database).
