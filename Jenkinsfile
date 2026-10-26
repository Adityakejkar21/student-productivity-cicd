
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t student-productivity-app:latest ./frontend'
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                    docker rm -f student-productivity-app || true
                    docker run -d \
                        --name student-productivity-app \
                        --restart unless-stopped \
                        -p 3000:80 \
                        student-productivity-app:latest
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker ps --filter name=student-productivity-app'
                sh 'curl --fail http://localhost:3000/'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Application built and deployed!'
        }
        failure {
            echo 'FAILED: Check the Jenkins console output.'
        }
    }
}
