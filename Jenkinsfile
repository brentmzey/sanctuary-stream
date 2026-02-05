pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        RUST_VERSION = 'stable'
        CARGO_HOME = "${WORKSPACE}/.cargo"
        RUSTUP_HOME = "${WORKSPACE}/.rustup"
    }
    
    parameters {
        choice(name: 'BUILD_TARGET', choices: ['all', 'desktop', 'mobile', 'web'], description: 'Build target')
        string(name: 'VERSION', defaultValue: 'v0.1.0', description: 'Release version')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy after build')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git fetch --tags'
            }
        }
        
        stage('Setup') {
            parallel {
                stage('Setup Node.js') {
                    steps {
                        sh '''
                            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                            node --version
                            npm --version
                        '''
                    }
                }
                
                stage('Setup Rust') {
                    steps {
                        sh '''
                            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
                            export PATH="$CARGO_HOME/bin:$PATH"
                            rustup default stable
                            rustc --version
                            cargo --version
                        '''
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install
                    cd sanctuary-app && npm install
                    cd ../sanctuary-bridge && npm install
                '''
            }
        }
        
        stage('Validation') {
            parallel {
                stage('Type Check') {
                    steps {
                        sh 'npm run typecheck'
                    }
                }
                
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                
                stage('Test') {
                    steps {
                        sh 'npm test'
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        sh '''
                            npm audit --audit-level=moderate
                            cargo install cargo-audit
                            cd sanctuary-app/src-tauri && cargo audit
                        '''
                    }
                }
            }
        }
        
        stage('Build Desktop') {
            when {
                expression { params.BUILD_TARGET == 'all' || params.BUILD_TARGET == 'desktop' }
            }
            parallel {
                stage('Build Linux') {
                    agent {
                        label 'linux'
                    }
                    steps {
                        sh '''
                            sudo apt-get update
                            sudo apt-get install -y libwebkit2gtk-4.0-dev \
                                build-essential curl wget file libssl-dev \
                                libgtk-3-dev libayatana-appindicator3-dev \
                                librsvg2-dev
                            cd sanctuary-app
                            npm run build
                            npm run tauri build
                        '''
                        archiveArtifacts artifacts: 'sanctuary-app/src-tauri/target/release/bundle/**/*', fingerprint: true
                    }
                }
                
                stage('Build macOS') {
                    agent {
                        label 'macos'
                    }
                    steps {
                        sh '''
                            cd sanctuary-app
                            npm run build
                            npm run tauri:build:mac
                        '''
                        archiveArtifacts artifacts: 'sanctuary-app/src-tauri/target/universal-apple-darwin/release/bundle/**/*', fingerprint: true
                    }
                }
                
                stage('Build Windows') {
                    agent {
                        label 'windows'
                    }
                    steps {
                        bat '''
                            cd sanctuary-app
                            npm run build
                            npm run tauri build
                        '''
                        archiveArtifacts artifacts: 'sanctuary-app/src-tauri/target/release/bundle/**/*', fingerprint: true
                    }
                }
            }
        }
        
        stage('Build Mobile') {
            when {
                expression { params.BUILD_TARGET == 'all' || params.BUILD_TARGET == 'mobile' }
            }
            parallel {
                stage('Build iOS') {
                    agent {
                        label 'macos'
                    }
                    steps {
                        sh '''
                            cd sanctuary-app
                            npm run tauri:ios:build
                        '''
                        archiveArtifacts artifacts: 'sanctuary-app/gen/apple/**/*.ipa', fingerprint: true
                    }
                }
                
                stage('Build Android') {
                    agent {
                        label 'linux'
                    }
                    steps {
                        sh '''
                            export ANDROID_HOME=/opt/android-sdk
                            export NDK_HOME=$ANDROID_HOME/ndk/25.1.8937393
                            cd sanctuary-app
                            npm run tauri:android:build
                        '''
                        archiveArtifacts artifacts: 'sanctuary-app/gen/android/**/release/**/*', fingerprint: true
                    }
                }
            }
        }
        
        stage('Build Web') {
            when {
                expression { params.BUILD_TARGET == 'all' || params.BUILD_TARGET == 'web' }
            }
            steps {
                sh '''
                    cd sanctuary-app
                    npm run build
                '''
                archiveArtifacts artifacts: 'sanctuary-app/dist/**/*', fingerprint: true
            }
        }
        
        stage('Deploy') {
            when {
                expression { params.DEPLOY == true }
            }
            parallel {
                stage('Deploy Web to Vercel') {
                    steps {
                        withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                            sh '''
                                npm install -g vercel
                                cd sanctuary-app
                                vercel --token $VERCEL_TOKEN --prod
                            '''
                        }
                    }
                }
                
                stage('Upload to GitHub Releases') {
                    steps {
                        withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                            sh '''
                                gh release create ${VERSION} \
                                    sanctuary-app/src-tauri/target/release/bundle/**/* \
                                    --title "Release ${VERSION}" \
                                    --notes "Automated release from Jenkins"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Notify') {
            steps {
                script {
                    if (currentBuild.result == 'SUCCESS') {
                        slackSend(color: 'good', message: "✅ Build ${params.VERSION} completed successfully!")
                    } else {
                        slackSend(color: 'danger', message: "❌ Build ${params.VERSION} failed!")
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Build completed successfully!'
        }
        failure {
            echo '❌ Build failed!'
        }
    }
}
