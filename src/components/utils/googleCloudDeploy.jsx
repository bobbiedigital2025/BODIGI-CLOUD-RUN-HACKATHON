/**
 * Google Cloud Deployment Utilities
 * For deploying BoDiGi to Cloud Run via Cloud Build
 */

export const DEPLOYMENT_CONFIG = {
  projectId: import.meta.env.VITE_GCP_PROJECT_ID || 'bodigi-hackathon',
  region: import.meta.env.VITE_GCP_REGION || 'us-east5',
  artifactRegistry: 'us-east5-docker.pkg.dev',
  serviceName: 'bodigi-frontend'
};

/**
 * Generate Dockerfile content for Cloud Run deployment
 */
export function generateDockerfile() {
  return `# BoDiGi™ - Google Cloud Run Dockerfile
# Multi-stage build for optimized production deployment

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]`;
}

/**
 * Generate Cloud Build configuration
 */
export function generateCloudBuild(geminiApiKey = 'your-gemini-api-key') {
  return `# BoDiGi™ - Google Cloud Build Configuration
steps:
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
    id: 'install-dependencies'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:$SHORT_SHA'
      - '-t'
      - 'us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:latest'
      - '.'
    id: 'build-image'
    waitFor: ['install-dependencies']

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:$SHORT_SHA'
    id: 'push-image'
    waitFor: ['build-image']

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:latest'
    id: 'push-latest'
    waitFor: ['push-image']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'bodigi-frontend'
      - '--image=us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:$SHORT_SHA'
      - '--region=us-east5'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--port=8080'
      - '--memory=512Mi'
      - '--cpu=1'
      - '--min-instances=0'
      - '--max-instances=10'
      - '--set-env-vars=VITE_GEMINI_API_KEY=\${_GEMINI_API_KEY}'
      - '--set-env-vars=VITE_GCP_PROJECT_ID=$PROJECT_ID'
      - '--set-env-vars=VITE_GCP_REGION=us-east5'
    id: 'deploy-cloud-run'
    waitFor: ['push-latest']

images:
  - 'us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:$SHORT_SHA'
  - 'us-east5-docker.pkg.dev/$PROJECT_ID/bodigi-images/bodigi-frontend:latest'

substitutions:
  _GEMINI_API_KEY: '${geminiApiKey}'

timeout: '1200s'

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'N1_HIGHCPU_8'`;
}

/**
 * Generate nginx configuration
 */
export function generateNginxConf() {
  return `server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }
}`;
}

/**
 * Generate .env file content
 */
export function generateEnvFile(geminiApiKey = 'your-api-key-here') {
  return `# Google AI Studio
VITE_GEMINI_API_KEY=${geminiApiKey}

# Google Cloud Project
VITE_GCP_PROJECT_ID=your-project-id
VITE_GCP_REGION=us-east5`;
}

/**
 * Generate .dockerignore content
 */
export function generateDockerIgnore() {
  return `node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
dist
coverage
.vscode
.idea
*.md
!README.md
Dockerfile
.dockerignore
.eslintrc.js
.prettierrc`;
}

/**
 * Generate package.json for deployment
 */
export function generatePackageJson() {
  return `{
  "name": "bodigi",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview --host 0.0.0.0 --port 8080"
  }
}`;
}

/**
 * Get deployment instructions for user
 */
export function getDeploymentInstructions() {
  const { projectId, region, serviceName } = DEPLOYMENT_CONFIG;

  return `
# 🚀 Deploy BoDiGi to Google Cloud Run

## Prerequisites
1. Install Google Cloud SDK: https://cloud.google.com/sdk/install
2. Login: \`gcloud auth login\`
3. Set project: \`gcloud config set project ${projectId}\`

## Enable Required APIs
\`\`\`bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
\`\`\`

## Create Artifact Registry Repository (first time only)
\`\`\`bash
gcloud artifacts repositories create bodigi-images \\
  --repository-format=docker \\
  --location=${region} \\
  --description="BoDiGi Docker images"
\`\`\`

## Option 1: Deploy via Cloud Build (Recommended)
\`\`\`bash
# Set your Gemini API key as substitution
gcloud builds submit --config cloudbuild.yaml \\
  --substitutions=_GEMINI_API_KEY="your-gemini-api-key-here"
\`\`\`

## Option 2: Manual Docker Build & Deploy
\`\`\`bash
# 1. Build the image
docker build -t ${region}-docker.pkg.dev/${projectId}/bodigi-images/${serviceName}:latest .

# 2. Configure Docker auth
gcloud auth configure-docker ${region}-docker.pkg.dev

# 3. Push to Artifact Registry
docker push ${region}-docker.pkg.dev/${projectId}/bodigi-images/${serviceName}:latest

# 4. Deploy to Cloud Run
gcloud run deploy ${serviceName} \\
  --image ${region}-docker.pkg.dev/${projectId}/bodigi-images/${serviceName}:latest \\
  --platform managed \\
  --region ${region} \\
  --allow-unauthenticated \\
  --port 8080 \\
  --memory 512Mi \\
  --cpu 1 \\
  --min-instances 0 \\
  --max-instances 10 \\
  --set-env-vars VITE_GEMINI_API_KEY="your-api-key"
\`\`\`

## After Deployment
Your app will be live at:
https://${serviceName}-[random-hash].a.run.app

## Set Custom Domain (Optional)
\`\`\`bash
gcloud beta run domain-mappings create \\
  --service ${serviceName} \\
  --domain bodigi.com \\
  --region ${region}
\`\`\`

## Monitor Logs
\`\`\`bash
gcloud run logs tail ${serviceName} --region ${region}
\`\`\`

## Update Deployment
\`\`\`bash
# Rebuild and redeploy
gcloud builds submit --config cloudbuild.yaml
\`\`\`
`;
}

/**
 * Validate Google Cloud setup
 */
export async function validateGCPSetup() {
  const checks = [];

  // Check if Gemini API key is configured
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    checks.push({
      name: 'Gemini API Key',
      status: 'configured',
      message: 'API key found in environment'
    });
  } else {
    checks.push({
      name: 'Gemini API Key',
      status: 'missing',
      message: 'Add VITE_GEMINI_API_KEY to your .env file'
    });
  }

  // Check if GCP project is configured
  if (import.meta.env.VITE_GCP_PROJECT_ID) {
    checks.push({
      name: 'GCP Project ID',
      status: 'configured',
      message: `Project: ${import.meta.env.VITE_GCP_PROJECT_ID}`
    });
  } else {
    checks.push({
      name: 'GCP Project ID',
      status: 'warning',
      message: 'Using default project ID. Set VITE_GCP_PROJECT_ID for custom project.'
    });
  }

  return checks;
}

/**
 * Generate deployment command for user
 */
export function generateDeployCommand(geminiApiKey) {
  const { projectId } = DEPLOYMENT_CONFIG;

  return `gcloud builds submit --config cloudbuild.yaml --substitutions=_GEMINI_API_KEY="${geminiApiKey}" --project=${projectId}`;
}

/**
 * Cloud Run service configuration
 */
export const CLOUD_RUN_CONFIG = {
  memory: '512Mi',
  cpu: '1',
  minInstances: 0,
  maxInstances: 10,
  port: 8080,
  timeout: '300s',
  concurrency: 80,
  environmentVariables: [
    'VITE_GEMINI_API_KEY',
    'VITE_GCP_PROJECT_ID',
    'VITE_GCP_REGION'
  ]
};

export default {
  DEPLOYMENT_CONFIG,
  CLOUD_RUN_CONFIG,
  generateDockerfile,
  generateCloudBuild,
  generateNginxConf,
  generateEnvFile,
  generateDockerIgnore,
  generatePackageJson,
  getDeploymentInstructions,
  validateGCPSetup,
  generateDeployCommand
};