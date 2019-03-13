# Helm setup for sample-app

This sample will walk us thru the processes required to deploy a sample application into a GKE.

**Note**: This helm sample assumes that you have running a GKE cluster in a GCP account, you can verify on which GKE cluster you are connected by running `kubectl config get-context`

Set needed information to run Helm on GKE:

Setup a Service Account for Helm Tiller, associate it to cluster-admin role and finally initialize Helm

```bash
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller

helm init --service-account tiller
```

Verify that helm tiller is running on kube-system namespace

```bash
kubectl get po -n kube-system | grep tiller

# Update the helm charts repository
helm repo update
```

## Setup environments in GKE

The environments as worspace can be set as namespaces in Kubernetes. Let's create two environments:

```bash
kubectl create namespace prod
kubectl create namespace preprod
```

Deploy sampleapp into each environment

```bash
helm install -f preprod_values.yaml --namespace=preprod --name=sampleapp-preprod sampleapp-chart/  --wait
helm install -f prod_values.yaml --namespace=prod --name=sampleapp-prod sampleapp-chart  --wait
```

Explore and review the deployment made by helm

```bash
helm ls --all	# List all releases deployed by helm

kubect get pods -n preprod
kubect get pods -n prod

kubect get deployments -n preprod
kubect get deployments -n prod
```

In order to get access to the web application, retrieve the public address for each environment and verify the app is available

```bash
kubect get services -n preprod
kubect get services -n prod
```

Check what container have deployed each pod

```bash
kubectl get pods -o jsonpath --template='{range .items[*]}{.metadata.name}{"\t"}{"\t"}{.spec.containers[0].image}{"\n"}{end}' --all-namespaces
```

## Making updates to the release

Eventually you will be doing changes to the chart or you will get an updated and enhanced application (docker image). In order to deploy the change you have to run `helm upgrade` as follows.

```bash
helm upgrade -f preprod_values.yaml --namespace=preprod sampleapp-preprod ./sampleapp-chart  --wait
```

Optionally you can set some values of the chart as input parameter in the command line execution

```bash
helm upgrade --set image.repository="gcr.io/dummy-233720/sample-app" --set image.tag="v1" sampleapp-preprod sampleapp-chart/  --wait
```

## Rolling back changes

If you are in a situation you need to rollback the last deployment you have to basically check in the helm history of releases and pick a version to rollback. 

```bash
helm history sampleapp-preprod

helm rollback --name=sampleapp-preprod 0
```

Note: If you set the revision number to `0` then it will just rollback to the last successful deployment.

## Clean up

```bash
helm delete --purge sampleapp-preprod
helm delete --purge sampleapp-prod

kubectl delete namespace preprod
kubectl delete namespace prod
```
