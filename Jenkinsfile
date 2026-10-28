pipeline {
    agent any

    stages {
        stage('Git Pull') {
            steps {
                script {
                    echo 'Starting Git pull...'

                    try {
                        git branch: 'main',
                            url: 'https://github.com/buildwithsumeet/ai-bank-app.git'

                        echo 'Git pull successful!'
                    } catch (Exception e) {
                        echo "Git pull failed: ${e.message}"
                        throw e
                    }
                }
            }
        }
        
    }
}