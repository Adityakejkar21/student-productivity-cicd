pipeline {
    agent any

    environment {
        // Configure Docker Hub username via Jenkins environment variable or override below
        DOCKERHUB_USER = "${env.DOCKERHUB_USER ?: 'your-dockerhub-username'}"
        IMAGE_FRONTEND = "${DOCKERHUB_USER}/mern-app-frontend"
        IMAGE_BACKEND  = "${DOCKERHUB_USER}/mern-app-backend"
        BUILD_TAG      = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo 'Installing backend dependencies from root package.json...'
                        // Root package.json manages backend dependencies
                        sh 'npm ci'
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo 'Installing frontend dependencies from frontend/package.json...'
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running automated tests...'
                // Validates backend health endpoint before building Docker images
                sh 'NODE_ENV=test npm test'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Validating frontend build (Vite)...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Building Docker images with tag: ${BUILD_TAG}..."
                sh """
                    docker build -t ${IMAGE_FRONTEND}:${BUILD_TAG} -t ${IMAGE_FRONTEND}:latest ./frontend
                    docker build -t ${IMAGE_BACKEND}:${BUILD_TAG} -t ${IMAGE_BACKEND}:latest -f backend/Dockerfile .
                """
            }
        }

        stage('Push to Docker Hub') {
            when {
                // Skips push if placeholder username is unchanged or credentials not set
                expression { env.DOCKERHUB_USER != 'your-dockerhub-username' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh """
                        echo "\$DH_PASS" | docker login -u "\$DH_USER" --password-stdin
                        docker push ${IMAGE_FRONTEND}:${BUILD_TAG}
                        docker push ${IMAGE_FRONTEND}:latest
                        docker push ${IMAGE_BACKEND}:${BUILD_TAG}
                        docker push ${IMAGE_BACKEND}:latest
                    """
                }
            }
        }

        stage('Deploy to EC2 (Docker Compose)') {
            steps {
                echo 'Deploying application containers with Docker Compose...'
                sh '''
                    docker compose down || true
                    docker compose up -d --build
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully! Application is up and running.'
        }
        failure {
            echo 'Pipeline failed. Please inspect stage logs above.'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
