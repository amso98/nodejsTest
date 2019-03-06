# Sample app to run on Kubernetes

## Building and running on Docker

    docker build -t sample-app:v1 .
    docker run --name sample-app -p 3000:3000 -d sample-app:v1

## Uploading to Google Cloud Container Registry

    gcloud auth configure-docker
    docker tag sample-app:v1 gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v1
    docker push gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v1
    gcloud container images list
    gcloud container images list-tags gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app

## Creating a Kubernetes cluster

    gcloud container clusters create *REPLACE_WITH_YOUR_NAME*
    gcloud container clusters get-credentials *REPLACE_WITH_YOUR_NAME*
    kubectl get nodes
    kubectl get pods
    kubectl get pods --all-namespaces
    kubectl proxy --port=8080

Open http://localhost:8080/ on your browser.

# Imperative deployments

## Deploying the sample app

    kubectl run sample-app \
    --image gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v1 \
    --port 3000

    kubectl get pods
    kubectl get deployments

    kubectl expose deployment sample-app \
    --type LoadBalancer \
    --port 80 \
    --target-port 3000

    kubectl get service sample-app

Visit `http://EXTERNAL-IP/` on your browser.

## Scaling the sample app

    kubectl scale deployment/sample-app \
    --replicas 10

    kubectl get pods -o wide

    kubectl logs -f deployment/sample-app

## Updating the sample app

    # Edit line 10 on views/index.pug with the following:
    section.hero.is-fullheight.has-background-warning

    docker build -t gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v2 .
    docker push gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v2
    gcloud container images list-tags gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app

    kubectl set image deployment/sample-app \
    sample-app=gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v2

    kubectl get pods -w

Visit `http://EXTERNAL-IP/` periodically to get the update.

# Declarative deployments

## Exporting the current app

    mkdir kubernetes
    cd kubernetes
    kubectl get deployment/sample-app --export -o yaml > sample-app-deployment.yaml
    kubectl get service/sample-app --export -o yaml > sample-app-service.yaml


## Rolling back and scaling down

    # Edit sample-app-deployment.yaml
    # Line 14:
    replicas: 5
    # Line 31:
    - image: gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v1

    # Perform the update
    kubectl replace -f sample-app-deployment.yaml

## Delete the deployment

    kubectl delete -f sample-app-deployment.yaml
    kubectl get pods -o wide

Then wait for all pods to be removed from Kubernetes.

## Failing health and readyness checks

    # Add the checks after line 33 on sample-app-deployment.yaml:
    readinessProbe:
        httpGet:
        path: /readyZZZ
        port: 3000
    livenessProbe:
        httpGet:
        path: /healthZZZ
        port: 3000

    kubectl create -f sample-app-deployment.yaml
    kubectl get pods -o wide

Visit `http://EXTERNAL-IP/` to get an error, showing the checks are in place.

## Fixing the healthcheck and readyness probes

    # Remove the ZZZ letters from the checks on sample-app-deployment.yaml:
    readinessProbe:
        httpGet:
        path: /ready
        port: 3000
    livenessProbe:
        httpGet:
        path: /health
        port: 3000

    kubectl replace -f sample-app-deployment.yaml
    kubectl get pods -o wide

Visit `http://EXTERNAL-IP/` to visit the site.

# Cleaning up resources

## Delete the app

    kubectl delete -f sample-app-service.yaml
    kubectl delete -f sample-app-deployment.yaml

## Delete the container images

    gcloud container images delete gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v1
    gcloud container images delete gcr.io/*REPLACE_WITH_YOUR_NAME*/sample-app:v2

## Delete the Kubernetes cluster

    gcloud container clusters delete *REPLACE_WITH_YOUR_NAME*

![](https://cdn.dribbble.com/users/19781/screenshots/656766/thatsallfolkx.png)