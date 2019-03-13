def project = 'dummy-233720'
def appName = 'sample-app'
def imageTag = "gcr.io/${project}/${appName}:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"

pipeline {
  agent {
    kubernetes {
      label 'sample-app'
      defaultContainer 'jnlp'
      yaml """
apiVersion: v1
kind: Pod
metadata:
labels:
  component: ci
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: cicd-jenkins
  containers:
  - name: gcloud
    image: gcr.io/cloud-builders/gcloud
    command:
    - cat
    tty: true
  - name: kubectl
    image: gcr.io/cloud-builders/kubectl
    command:
    - cat
    tty: true
  - name: helm
    image: alpine/helm
    command:
    - cat
    tty: true
"""
}
  }
  stages {
    stage('Build and push image with Container Builder') {
      steps {
        container('gcloud') {
          sh "PYTHONUNBUFFERED=1 gcloud builds submit -t ${imageTag} ."
        }
      }
    }

    stage('Deploy Production') {
      when { branch 'master' }
      steps{
        container('helm') {
          sh("echo prod")
          sh("helm version")
        }
      }
    }

    stage('Deploy Dev') {
      when { 
        not { branch 'master' } 
      } 
      steps {
        container('kubectl') {
         sh("kubectl get ns ${env.BRANCH_NAME} || kubectl create ns ${env.BRANCH_NAME}")
        }
        container('helm') {
         sh("helm version")
         sh("  helm upgrade --install --namespace=${env.BRANCH_NAME} --set image.repository=gcr.io/${project}/${appName} --set image.tag=${env.BRANCH_NAME}.${env.BUILD_NUMBER} sampleapp-${env.BRANCH_NAME} ./helm/sampleapp-chart  --wait")
        }
      }     
    }
  }
}
