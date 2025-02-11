# k8s-microservices

trigger commits

https://github.com/prometheus-operator/kube-prometheus
minikube delete && minikube start --kubernetes-version=v1.28.3 --memory=6g --bootstrapper=kubeadm --extra-config=kubelet.authentication-token-webhook=true --extra-config=kubelet.authorization-mode=Webhook --extra-config=scheduler.bind-address=0.0.0.0 --extra-config=controller-manager.bind-address=0.0.0.0
minikube addons disable metrics-server

helm install istio-base istio/base --version 1.23.4 -n istio-system --create-namespace
helm install istiod istio/istiod --version 1.23.4 -n istio-system
helm install istio-ingress istio/gateway --version 1.23.4 -n istio-system
kubectl label namespace default istio-injection=enabled
kubectl label namespace default opa-istio-injection="enabled"

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring
kubectl get pods -n monitoring

## Get the Grafana admin password:
kubectl --namespace monitoring get secrets monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo
export POD_NAME=$(kubectl --namespace monitoring get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=monitoring" -oname)
kubectl --namespace monitoring port-forward $POD_NAME 3000

## Deploy Loki
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install loki grafana/loki-stack -n monitoring --set promtail.enabled=true --set loki.image.tag=2.9.1