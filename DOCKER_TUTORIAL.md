# Docker Tutorial - Step by Step Guide

## Prerequisites Check

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Verify installation:
     ```sh
     docker --version
     docker-compose --version
     ```

---

## Understanding the Flow

```
Your application code
    ↓
Dockerfile (instructions to build image)
    ↓
Docker Image (snapshot/template)
    ↓
Docker Container (running instance)
```

**Analogy:**

- Dockerfile = Recipe
- Image = Cake mix (ready to bake)
- Container = Actual cake (running)

---

## Step 1: Build Your First Image

```sh
# Navigate to your project
cd "c:\Users\muham\Documents\Maktab App\git\maktab-pro\services\authMS"

# Build the image
docker build -t authms:v1 .
```

**What happens:**

1. Docker reads Dockerfile line by line
2. Each line creates a "layer" (cached for speed)
3. Stage 1: Installs deps → compiles TypeScript
4. Stage 2: Creates clean image with only runtime needs
5. Final image tagged as "authms:v1"

**Check your image:**

```sh
docker images
# You'll see: authms with tag v1
```

---

## Step 2: Run a Container (Without Database)

```sh
# Run your image
docker run -p 5000:5000 -e JWT_SECRET=test123 -e DB_URI=mongodb://localhost:27017/authms authms:v1
```

**What this does:**

- `docker run` = create and start container
- `-p 5000:5000` = map ports (your computer:container)
- `-e JWT_SECRET=test123` = set environment variable
- `authms:v1` = which image to run

**Problem:** This will fail! Why?

- Your app tries to connect to MongoDB
- MongoDB isn't running yet
- This is why we need docker-compose!

Stop it with: `Ctrl+C`

---

## Step 3: Run with Docker Compose (App + Database)

```sh
# Set your JWT secret (Windows PowerShell)
$env:JWT_SECRET="my_super_secret_key_12345"

# Start everything
docker-compose up --build
```

**What happens:**

1. Builds authms image from Dockerfile
2. Pulls MongoDB image from Docker Hub
3. Creates a network for services to communicate
4. Starts MongoDB container
5. Starts AuthMS container
6. AuthMS connects to MongoDB using service name "mongo"

**Test it:**

- Open browser: http://localhost:5000
- Or use Postman/curl to test your endpoints

**View logs:**

```sh
# In another terminal
docker-compose logs -f authms  # Follow authms logs
docker-compose logs -f mongo   # Follow mongo logs
```

---

## Step 4: Explore Running Containers

```sh
# List running containers
docker ps

# Execute commands inside container
docker-compose exec authms sh
# Now you're inside the container!
# Try: ls, pwd, node --version
# Exit with: exit

# Check MongoDB
docker-compose exec mongo mongosh
# You're in MongoDB shell!
# Try: show dbs
# Exit with: exit
```

---

## Step 5: Stop and Clean Up

```sh
# Stop containers (keeps data)
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v

# Remove unused images
docker image prune
```

---

## Common Issues & Solutions

### Issue 1: Port already in use

```
Error: bind: address already in use
```

**Solution:** Another app is using port 5000

```sh
# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Use 5001 on your computer instead
```

### Issue 2: Changes not reflected

**Solution:** Rebuild the image

```sh
docker-compose up --build
```

### Issue 3: Database connection fails

**Solution:** Check DB_URI uses service name

```yaml
DB_URI=mongodb://mongo:27017/authms  # ✅ Correct
DB_URI=mongodb://localhost:27017/authms  # ❌ Wrong
```

---

## Development Workflow

### Option A: Docker for Everything

```sh
# Make code changes
# Rebuild and restart
docker-compose up --build
```

**Pros:** Exact production environment
**Cons:** Slower (rebuild on every change)

### Option B: Hybrid (Recommended for Development)

```sh
# Run only MongoDB in Docker
docker-compose up mongo

# Run your app normally
npm run dev
# Change DB_URI in .env.development to: mongodb://localhost:27017/authms
```

**Pros:** Fast development (hot reload works)
**Cons:** Not exactly like production

### Option C: Docker with Volume Mounting (Advanced)

Add to docker-compose.yml:

```yaml
authms:
  volumes:
    - ./src:/app/src # Mount source code
  command: npm run dev # Use dev mode
```

**Pros:** Best of both worlds
**Cons:** More complex setup

---

## Key Concepts Summary

| Concept          | What It Is              | Example                         |
| ---------------- | ----------------------- | ------------------------------- |
| **Image**        | Template/snapshot       | authms:v1                       |
| **Container**    | Running instance        | Your app running                |
| **Volume**       | Persistent storage      | Database data                   |
| **Network**      | Container communication | authms ↔ mongo                 |
| **Port mapping** | Access from outside     | localhost:5000 → container:5000 |

---

## Next Steps

1. **Try modifying the Dockerfile**
   - Change Node version to 20
   - Add health checks
2. **Add more services**
   - Redis for caching
   - Nginx as reverse proxy

3. **Learn Docker commands**

   ```sh
   docker ps              # List containers
   docker images          # List images
   docker logs <id>       # View logs
   docker exec -it <id> sh # Enter container
   docker system prune    # Clean up everything
   ```

4. **Production deployment**
   - Push image to Docker Hub
   - Deploy to AWS ECS, Azure Container Instances, or Google Cloud Run

---

## Questions to Test Your Understanding

1. Why do we use multi-stage builds?
2. What's the difference between COPY and RUN?
3. Why does the app use "mongo" instead of "localhost" for DB_URI?
4. What happens to database data when you run `docker-compose down`?
5. Why do we copy package.json before copying the rest of the code?

**Answers in Dockerfile.annotated and docker-compose.annotated.yml!**
