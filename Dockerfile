# ============================================
# STAGE 1: BUILD STAGE
# ============================================
# Why: We compile TypeScript to JavaScript here
# This stage will be discarded after build completes

FROM node:18-alpine AS builder
# FROM = base image to start from
# node:18-alpine = Node.js v18 on Alpine Linux (tiny Linux, ~5MB vs ~900MB for full Ubuntu)
# AS builder = name this stage "builder" so we can reference it later

WORKDIR /app
# WORKDIR = set working directory inside container
# All subsequent commands run from /app

COPY package*.json ./
# COPY = copy files from your computer into the container
# package*.json = copies both package.json and package-lock.json

RUN npm ci
# RUN = execute a command inside the container
# npm ci = clean install (faster, more reliable than npm install for CI/CD)

COPY . .
# Copy everything else from your project
# Why after npm ci? So code changes don't invalidate the npm install cache

RUN npm run build
# Compile TypeScript → JavaScript
# Output goes to /app/dist folder


# ============================================
# STAGE 2: PRODUCTION STAGE
# ============================================
# Why: Create a smaller final image with only what's needed to run

FROM node:18-alpine
# Start fresh with a new clean Node.js image
# This won't include TypeScript compiler or other build tools

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts
# --omit=dev = skip devDependencies (TypeScript, Jest, ESLint, etc.)
# --ignore-scripts = prevent prepare/hooks from running in the runtime image
# Only install production dependencies (express, mongoose, bcrypt, etc.)

COPY --from=builder /app/dist ./dist
# Copy ONLY the compiled JavaScript from the builder stage
# --from=builder = grab files from stage 1

EXPOSE 5000
# EXPOSE = document which port the app listens on
# This is just documentation; doesn't actually open the port

CMD ["node", "dist/server.js"]
# CMD = default command to run when container starts
# This starts your Express server


# ============================================
# WHY MULTI-STAGE BUILD?
# ============================================
# Single stage: ~500MB (includes TypeScript, build tools, source code)
# Multi-stage: ~150MB (only Node.js + compiled code + runtime dependencies)
# 
# Stage 1 (builder): Has everything needed to BUILD
# Stage 2 (final): Has only what's needed to RUN
# Docker automatically discards stage 1 after copying what we need
