# MERN DevOps - CI/CD Pipeline with Docker, Jenkins & AWS EC2

> A beginner-friendly, production-style CI/CD pipeline for a MERN e-commerce application containerized with **Docker**, automated with **Jenkins**, and hosted on an **AWS EC2** instance.

---

## 1. Project Overview & Architecture

This repository delivers a full-stack MERN (MongoDB, Express, React, Node.js) web application using modern DevOps practices:

- **Frontend**: React 18 with Vite, Redux Toolkit, and Tailwind CSS, served through Nginx.
- **Backend**: Node.js & Express API with a `/api/health` health check endpoint.
- **Database**: MongoDB 7 container with persistent volume storage.
- **Containerization**: Multi-stage Dockerfiles and Docker Compose for orchestration.
- **CI/CD Pipeline**: Declarative Jenkins pipeline automating testing, building, pushing to Docker Hub, and deploying containers to EC2.
- **Cloud Infrastructure**: Single AWS EC2 instance running Jenkins and application containers.

```
[ Developer Git Push ]
          │
          ▼
[ GitHub Repository ] ──(Webhook / Poll)──► [ Jenkins on EC2 ]
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
               1. Test & Build                2. Build & Push Images           3. Deploy Stack
               • npm test (Health check)      • Docker Hub (Frontend)          • docker compose down
               • npm run build (Vite bundle)  • Docker Hub (Backend)           • docker compose up -d
```

---

## 2. Repository Structure

```
.
├── Jenkinsfile                  # Declarative CI/CD pipeline (Docker + EC2)
├── docker-compose.yml           # Multi-container orchestration (Frontend, Backend, Mongo)
├── package.json                 # Backend dependencies & scripts (includes npm test)
├── test/
│   └── health.test.js           # Automated test for /api/health
├── backend/
│   ├── Dockerfile               # Node.js 20 Alpine with non-root security user
│   ├── index.js                 # Express server & API routes
│   └── .env.example             # Template for backend environment variables
├── frontend/
│   ├── Dockerfile               # Multi-stage: Node build → Nginx Alpine serve
│   ├── nginx.conf               # React Router SPA routing & /api reverse proxy
│   └── package.json             # React/Vite dependencies
└── README.md                    # Project documentation
```

---

## 3. Local Development & Testing

### A. Run Automated Tests
The project includes a native Node.js automated test validating the backend `/api/health` endpoint:

```bash
# 1. Install backend dependencies (from project root)
npm install

# 2. Run the test suite
npm test
```

### B. Run the Full Stack with Docker Compose
To build and run all 3 services (Frontend, Backend, and MongoDB) locally:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:5000` (Port 5000)
- **Health Check**: `http://localhost/api/health` or `http://localhost:5000/api/health`

To stop the containers:
```bash
docker compose down
```

---

## 4. Jenkins CI/CD Pipeline Stages

The declarative `Jenkinsfile` runs the following stages on every build:

1. **Checkout**: Clones the latest commit from your GitHub repository.
2. **Install Dependencies**: Installs backend dependencies (root `package.json`) and frontend dependencies (`frontend/package.json`) in parallel using `npm ci`.
3. **Run Tests**: Executes `NODE_ENV=test npm test` to ensure API health checks pass before any Docker images are created.
4. **Build Frontend**: Compiles the React/Vite production bundle (`npm run build`).
5. **Build Docker Images**: Builds tagged Docker images for both `frontend` and `backend`.
6. **Push to Docker Hub**: Logs in securely to Docker Hub using Jenkins credentials and pushes both images.
7. **Deploy to EC2**: Deploys the updated containers using `docker compose down` and `docker compose up -d --build`.

---

## 5. Deployment Guide on AWS EC2

### Step 1: Launch an AWS EC2 Instance
1. Launch an EC2 instance (Ubuntu 22.04 LTS or Amazon Linux 2023, `t2.micro` or `t3.small`).
2. Configure Security Group Inbound Rules:
   - **Port 22** (SSH): Your IP
   - **Port 80** (HTTP): Anywhere (`0.0.0.0/0`) — to access the web application
   - **Port 8080** (Custom TCP): Anywhere or Your IP — to access the Jenkins dashboard

### Step 2: Install Docker on EC2
```bash
# Ubuntu
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
sudo systemctl enable --now docker
```

### Step 3: Run Jenkins in Docker on EC2
Run Jenkins with access to the host's Docker socket so it can build and run containers:

```bash
DOCKER_GID=$(getent group docker | cut -d: -f3)

docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $DOCKER_GID \
  --restart=always \
  jenkins/jenkins:lts

# Install docker CLI inside the Jenkins container
docker exec -it --user root jenkins bash -c "apt-get update && apt-get install -y docker.io"
sudo chmod 666 /var/run/docker.sock
```

Retrieve the initial Jenkins admin password:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Step 4: Configure Jenkins
1. Open `http://<EC2_PUBLIC_IP>:8080` in your browser and complete initial setup.
2. Install suggested plugins + NodeJS plugin.
3. In **Manage Jenkins → Credentials → System → Global credentials**:
   - Add a `Username with password` credential with ID `dockerhub-credentials` (your Docker Hub username and access token).
4. In your Jenkins Pipeline job:
   - Select **Pipeline script from SCM** $\to$ **Git**.
   - Enter your GitHub repository URL and branch (`main`).
   - Script Path: `Jenkinsfile`.
5. Trigger **Build Now**.

---

## 6. Verification

Once the pipeline completes:
- Open `http://<EC2_PUBLIC_IP>` in your browser to view the live storefront.
- Open `http://<EC2_PUBLIC_IP>/api/health` to confirm the backend health endpoint returns `{"status":"ok"}`.
