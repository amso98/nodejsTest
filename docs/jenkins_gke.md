# Running Jenkins on GKE

This example assumes:

- You have configured a valid GKE cluster in a GCP Account
- You have installed kubectl and helm
- You have installed helm tiller in the GKE

Note: In case you don't have yet a GKE you can provision a minimal cluster required for this excersise:

```bash
gcloud container clusters create dummy-cluster \
	--num-nodes 2 \
	--machine-type n1-standard-2 \
	--scopes "https://www.googleapis.com/auth/projecthosting,cloud-platform"
```

Note: Make sure you have enabled in the GCP Project: Cloud Build API
https://console.cloud.google.com/apis/api/cloudbuild.googleapis.com/overview?project=<PROJECT ID>

Give your self cluster-admin role in order to deploy a Jenkins installation that can interact with k8s:

```bash
kubectl create clusterrolebinding cluster-admin-binding --clusterrole=cluster-admin --user=$(gcloud config get-value account)
```

## Deploy Jenkins with helm

NOTE: You might need to change the initial repository that Jenkins is going to build by your own repo:

```bash
# Open the file jenkins_values.yaml and update the following line accordingly
remote('https://github.com/darvein/sample-app.git')
```

Also you will need to update the Jenkinsfile to build the proper docker image based on your GCP Project ID

```bash
# Open the Jenkinsfile on the top of this repository and change the following line
def project = 'dummy-233720'
```

```bash
helm install -n cicd stable/jenkins -f jenkins_values.yaml --wait

# Verify status with kubectl
kubectl describe pod cicd-jenkins
kubectl get svc
```

## Accessing to Jenkins installation

Once the deployment is finished, you will have to forward the internal IP and Port address of the POD to your machine:

```bash
export POD_NAME=$(kubectl get pods --namespace default -l "component=cicd-jenkins-master" -o jsonpath="{.items[0].metadata.name}")
kubectl port-forward $POD_NAME 8080:8080

# Get the admin password
printf $(kubectl get secret --namespace default cicd-jenkins -o jsonpath="{.data.jenkins-admin-password}" | base64 --decode);echo
```

While launching jobs you can see how k8s is providing pods to Jenkins as slaves agents:

```bash
kubectl get pods
kubectl get po --all-namespaces | egrep -v 'kube-system'
kubectl get svc --all-namespaces | egrep -v 'kube-system'
```

# Clean up

```bash
helm delete --purge cicd
```
