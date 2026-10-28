
pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Clean Slate') {
            steps {
                echo 'Resetting workspace...'
                deleteDir()
            }
        }

        stage('Git Pull') {
            steps {
                echo 'Starting Git checkout...'

                git branch: 'main',
                    url: 'https://github.com/buildwithsumeet/ai-bank-app.git'

                echo 'Git checkout successful!'
            }
        }

        stage('Unit Testing') {
            steps {
                echo 'Running unit testing...'

                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm test'
                }

                dir('backend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm test'
                }

                echo 'Unit testing passed!'
            }
        }

        stage('Docker Image Building') {
            steps {
                echo 'Building Docker images...'

                dir('backend') {
                    sh 'docker build -t apex-bank-backend:latest .'
                }

                dir('frontend') {
                    sh 'docker build -t apex-bank-frontend:latest .'
                }

                echo 'Docker images built successfully!'
            }
        }

        stage("Docker Image Testing Trivy") {
            steps {
                echo "Scanning Docker images with Trivy..."
                sh 'trivy image apex-bank-backend:latest'
                sh 'trivy image apex-bank-frontend:latest'
            }
        }

        stage('Docker Image Pushing') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKER_PASSWORD" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin
                    '''

                    sh '''
                        docker tag apex-bank-backend:latest \
                            "$DOCKER_USERNAME/apex-bank-backend:latest"

                        docker push \
                            "$DOCKER_USERNAME/apex-bank-backend:latest"
                    '''

                    sh '''
                        docker tag apex-bank-frontend:latest \
                            "$DOCKER_USERNAME/apex-bank-frontend:latest"

                        docker push \
                            "$DOCKER_USERNAME/apex-bank-frontend:latest"
                    '''

                    sh 'docker logout'

                    echo 'Docker images pushed successfully!'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
