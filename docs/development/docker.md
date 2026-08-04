# Docker Guide

AuthMS includes a Dockerfile and Docker Compose stack for local containerized development.

## Services

| Service  | Image                       | Purpose                      |
| -------- | --------------------------- | ---------------------------- |
| `authms` | Built from local Dockerfile | Runs the compiled AuthMS API |
| `mongo`  | `mongo:7`                   | Local MongoDB database       |

## Environment

The Compose stack sets:

```text
NODE_ENV=production
PORT=5000
DB_URI=mongodb://mongo:27017/authms
JWT_SECRET=${JWT_SECRET}
```

This means the app runs as a production build locally while using the Compose MongoDB container as a development database.

Set the JWT secret before starting:

```powershell
$env:JWT_SECRET="replace-with-a-long-random-secret"
```

## Commands

Build the image:

```powershell
docker compose build
```

Start attached:

```powershell
docker compose up --build
```

Start detached:

```powershell
docker compose up --build -d
```

View status:

```powershell
docker compose ps
```

View logs:

```powershell
docker compose logs authms
docker compose logs mongo
```

Stop containers:

```powershell
docker compose down
```

Remove containers and local MongoDB data:

```powershell
docker compose down -v
```

Use `-v` only when you intentionally want to delete the local MongoDB volume.

## Troubleshooting

### Insomnia cannot connect

Confirm containers are running:

```powershell
docker compose ps
```

Confirm the app responds:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/health -UseBasicParsing
```

### Docker cannot connect to `dockerDesktopLinuxEngine`

Start Docker Desktop and wait until the engine is running.

If Docker Desktop is stuck:

```powershell
wsl --shutdown
```

Then restart Docker Desktop.

### `npm ci` fails during image build

The lockfile may be out of sync with `package.json`.

```powershell
npm install --package-lock-only --ignore-scripts
docker compose build
```
