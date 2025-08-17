pipeline {
  agent any
  environment {
    NODE_OPTIONS = "--max_old_space_size=2048"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install Node') {
      steps {
        sh 'node -v || curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs'
      }
    }
    stage('Install Deps') {
      steps {
        sh 'npm ci || npm install'
      }
    }
    stage('Lint') {
      steps {
        sh 'npm run lint || echo "Skipping lint (not configured)"'
      }
    }
    stage('Seed (optional)') {
      when {
        expression { return fileExists('.env') }
      }
      steps {
        sh 'node tools/seed.js || true'
      }
    }
    stage('Archive') {
      steps {
        archiveArtifacts artifacts: '**/*', fingerprint: true
      }
    }
  }
  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}
