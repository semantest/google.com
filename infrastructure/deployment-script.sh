#!/bin/bash

# Production Infrastructure Deployment Script
# Deploy analytics backend and monitoring infrastructure

set -e

echo "🚀 Starting ChatGPT Extension Infrastructure Deployment..."

# Configuration
DOMAIN="analytics.semantest.com"
DASHBOARD_DOMAIN="dashboard.semantest.com"
DOCKER_REGISTRY="ghcr.io/semantest"
VERSION="1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    command -v docker >/dev/null 2>&1 || { print_error "Docker is required but not installed."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { print_error "Docker Compose is required but not installed."; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { print_error "kubectl is required but not installed."; exit 1; }
    
    print_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Analytics backend
    docker build -f infrastructure/Dockerfile.analytics \
        -t ${DOCKER_REGISTRY}/analytics-backend:${VERSION} \
        -t ${DOCKER_REGISTRY}/analytics-backend:latest \
        .
    
    # Dashboard frontend
    docker build -f infrastructure/Dockerfile.dashboard \
        -t ${DOCKER_REGISTRY}/analytics-dashboard:${VERSION} \
        -t ${DOCKER_REGISTRY}/analytics-dashboard:latest \
        .
    
    print_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    print_status "Pushing images to registry..."
    
    docker push ${DOCKER_REGISTRY}/analytics-backend:${VERSION}
    docker push ${DOCKER_REGISTRY}/analytics-backend:latest
    docker push ${DOCKER_REGISTRY}/analytics-dashboard:${VERSION}
    docker push ${DOCKER_REGISTRY}/analytics-dashboard:latest
    
    print_success "Images pushed to registry"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    print_status "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl create namespace semantest-analytics --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy PostgreSQL
    kubectl apply -f infrastructure/k8s/postgres.yaml -n semantest-analytics
    
    # Deploy Redis
    kubectl apply -f infrastructure/k8s/redis.yaml -n semantest-analytics
    
    # Deploy analytics backend
    envsubst < infrastructure/k8s/analytics-backend.yaml | kubectl apply -f - -n semantest-analytics
    
    # Deploy dashboard
    envsubst < infrastructure/k8s/analytics-dashboard.yaml | kubectl apply -f - -n semantest-analytics
    
    # Deploy ingress
    envsubst < infrastructure/k8s/ingress.yaml | kubectl apply -f - -n semantest-analytics
    
    print_success "Kubernetes deployment completed"
}

# Set up monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Deploy Prometheus
    kubectl apply -f infrastructure/k8s/prometheus.yaml -n semantest-analytics
    
    # Deploy Grafana
    kubectl apply -f infrastructure/k8s/grafana.yaml -n semantest-analytics
    
    # Deploy alerting rules
    kubectl apply -f infrastructure/k8s/alerting-rules.yaml -n semantest-analytics
    
    print_success "Monitoring setup completed"
}

# Configure SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Install cert-manager if not present
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    
    # Create cluster issuer
    kubectl apply -f infrastructure/k8s/cluster-issuer.yaml
    
    # Create certificates
    envsubst < infrastructure/k8s/certificates.yaml | kubectl apply -f -
    
    print_success "SSL certificates configured"
}

# Set up backup
setup_backup() {
    print_status "Setting up backup..."
    
    # Create backup storage
    kubectl apply -f infrastructure/k8s/backup-storage.yaml -n semantest-analytics
    
    # Deploy backup cron jobs
    kubectl apply -f infrastructure/k8s/backup-jobs.yaml -n semantest-analytics
    
    print_success "Backup setup completed"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=analytics-backend -n semantest-analytics --timeout=300s
    kubectl wait --for=condition=ready pod -l app=analytics-dashboard -n semantest-analytics --timeout=300s
    
    # Check service health
    BACKEND_URL="https://${DOMAIN}/health"
    DASHBOARD_URL="https://${DASHBOARD_DOMAIN}"
    
    print_status "Checking backend health at ${BACKEND_URL}"
    if curl -f -s "${BACKEND_URL}" > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    print_status "Checking dashboard at ${DASHBOARD_URL}"
    if curl -f -s "${DASHBOARD_URL}" > /dev/null; then
        print_success "Dashboard is accessible"
    else
        print_error "Dashboard accessibility check failed"
        exit 1
    fi
    
    print_success "Deployment verification completed"
}

# Create deployment summary
create_summary() {
    print_status "Creating deployment summary..."
    
    cat > deployment-summary.md << EOF
# ChatGPT Extension Infrastructure Deployment Summary

## 🚀 Deployment Details
- **Date**: $(date)
- **Version**: ${VERSION}
- **Environment**: Production

## 🌐 Endpoints
- **Analytics API**: https://${DOMAIN}
- **Dashboard**: https://${DASHBOARD_DOMAIN}
- **WebSocket**: wss://${DOMAIN}:8080

## 📊 Services Deployed
- ✅ Analytics Backend (Node.js + Express)
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ Real-time Dashboard
- ✅ Monitoring (Prometheus + Grafana)
- ✅ SSL Certificates
- ✅ Automated Backups

## 🔧 Configuration
- **Database**: PostgreSQL with automated backups
- **Cache**: Redis for real-time data
- **Monitoring**: Prometheus metrics + Grafana dashboards
- **Alerting**: Configured for critical errors
- **SSL**: Let's Encrypt certificates with auto-renewal

## 📈 Monitoring URLs
- **Grafana**: https://grafana.${DOMAIN}
- **Prometheus**: https://prometheus.${DOMAIN}

## 🚨 Alerting
- Critical errors: Slack notifications
- Low ratings: Team notifications
- High error rate: Automatic alerts

## 📋 Next Steps
1. Update extension configuration to use new endpoints
2. Test all analytics endpoints
3. Verify WebSocket connections
4. Monitor initial user data
5. Set up team access to dashboards

## 🔑 Access
- Dashboard admin access configured
- Monitoring dashboards accessible
- Backup verification scheduled

**Status**: ✅ DEPLOYMENT SUCCESSFUL
EOF

    print_success "Deployment summary created: deployment-summary.md"
}

# Main deployment function
main() {
    print_status "Starting infrastructure deployment for ChatGPT Extension v${VERSION}"
    
    check_prerequisites
    build_images
    push_images
    deploy_kubernetes
    setup_monitoring
    setup_ssl
    setup_backup
    verify_deployment
    create_summary
    
    print_success "🎉 Infrastructure deployment completed successfully!"
    print_status "Analytics API: https://${DOMAIN}"
    print_status "Dashboard: https://${DASHBOARD_DOMAIN}"
    print_status "Documentation: deployment-summary.md"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --domain DOMAIN    Set analytics domain (default: analytics.semantest.com)"
            echo "  --version VERSION  Set version tag (default: 1.0.0)"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main deployment
main