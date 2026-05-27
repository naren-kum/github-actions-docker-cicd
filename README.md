# GitHub Actions Docker CI/CD

# GitHub Actions Docker CI/CD

This repository demonstrates a complete GitHub Actions CI/CD pipeline for a simple Node.js application.

The project covers:

- GitHub Actions workflow fundamentals
- Pull request and main branch CI checks
- Node.js application testing
- Docker image build and runtime validation
- Docker Hub authentication using GitHub Secrets
- Docker image tagging and push
- Trivy container security scanning
- CI artifact generation

---

## Project Purpose

The goal of this project is to demonstrate a practical CI/CD workflow using GitHub Actions, Docker, Docker Hub, and security scanning.

This project is part of a DevOps portfolio and focuses on building a clean, understandable pipeline that follows common CI/CD stages:

```text
Code change
↓
Pull request / push trigger
↓
Run tests
↓
Build Docker image
↓
Run Docker container
↓
Scan image with Trivy
↓
Login to Docker Hub using secrets
↓
Push Docker image
↓
Upload CI summary artifact
Repository Structure
github-actions-docker-cicd/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── app.js
├── tests/
│   └── app.test.js
├── Dockerfile
├── .dockerignore
├── package.json
├── package-lock.json
└── README.md
Application Overview

This repository contains a simple Node.js application with a basic health/status function.

When the application runs, it returns a JSON response similar to:

{"status":"ok","service":"github-actions-docker-cicd"}

The application is intentionally simple so the focus remains on the CI/CD pipeline.

Local Development
Prerequisites

Install:

Node.js
npm
Docker
Git
Run tests locally
npm install
npm test

Expected output:

All tests passed
Run the application locally
npm start

Expected output:

{"status":"ok","service":"github-actions-docker-cicd"}
Docker Usage
Build Docker image locally
docker build -t github-actions-docker-cicd:test .
Run Docker container locally
docker run --rm github-actions-docker-cicd:test

Expected output:

{"status":"ok","service":"github-actions-docker-cicd"}
Dockerfile

The project uses a simple Node.js Dockerfile:

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
Dockerfile explanation
Instruction	Purpose
FROM node:22-alpine	Uses Node.js 22 Alpine as the base image
WORKDIR /app	Sets /app as the working directory inside the container
COPY package*.json ./	Copies package files first to improve Docker layer caching
RUN npm install	Installs Node.js dependencies during image build
COPY . .	Copies the application source code
CMD ["npm", "start"]	Starts the application when the container runs
Docker Ignore

The .dockerignore file prevents unnecessary files from being copied into the Docker build context.

.git
.github
node_modules
npm-debug.log
README.md

This helps keep the Docker image build context cleaner and avoids copying unnecessary local files.

GitHub Actions Workflow

The GitHub Actions workflow is defined in:

.github/workflows/ci.yml

The workflow runs on:

on:
  push:
    branches:
      - main
  pull_request:
  workflow_dispatch:
Trigger explanation
Trigger	Purpose
push to main	Runs CI when changes are pushed to main
pull_request	Runs CI when a PR is opened or updated
workflow_dispatch	Allows manual workflow execution from GitHub Actions UI
Pipeline Jobs

The workflow contains three main jobs:

test
docker-build
summary
Pipeline flow
test → docker-build → summary

The docker-build job depends on the test job using:

needs: test

The summary job depends on the docker-build job using:

needs: docker-build

This ensures the workflow only continues if the previous job succeeds.

Job 1: Test

The test job performs application validation.

Main steps:

Checkout repository
Validate environment secret
Setup Node.js
Install dependencies
Run tests
Print branch/PR context messages

Example steps:

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}

- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm test
Job 2: Docker Build

The docker-build job runs after the test job succeeds.

Main steps:

Checkout repository
Build Docker image
List Docker images
Run Docker container
Scan Docker image with Trivy
Validate Docker Hub secrets
Login to Docker Hub
Push Docker image to Docker Hub
Docker image build
docker build -t $IMAGE_NAME:${{ github.sha }} -t $IMAGE_NAME:latest .

This creates two Docker image tags:

Tag	Purpose
${{ github.sha }}	Immutable, traceable image tag based on Git commit SHA
latest	Convenient tag for the most recent build

Example image tags:

narenkum/github-actions-docker-cicd:<commit-sha>
narenkum/github-actions-docker-cicd:latest
Docker Hub Push

The workflow pushes the Docker image to Docker Hub using repository secrets.

Push commands:

docker push $IMAGE_NAME:${{ github.sha }}
docker push $IMAGE_NAME:latest

The Docker image is available in Docker Hub with both:

commit SHA tag
latest tag
GitHub Secrets

This workflow uses GitHub repository secrets for secure values.

Required secrets:

Secret Name	Purpose
ENVIRONMENT_NAME	Demo environment secret used for validation
DOCKERHUB_USERNAME	Docker Hub username
DOCKERHUB_TOKEN	Docker Hub access token/password

Secrets are configured in:

GitHub Repository → Settings → Secrets and variables → Actions
Secret usage syntax
${{ secrets.SECRET_NAME }}

Example:

- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
Secret validation example
- name: Validate Docker login secrets
  env:
    USER_NAME: ${{ secrets.DOCKERHUB_USERNAME }}
    USER_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
  run: |
    if [ -z "$USER_NAME" ] || [ -z "$USER_TOKEN" ]; then
      echo "Docker Hub username or token secret is missing"
      exit 1
    fi

    echo "Required Docker secrets are configured"

Important security rule:

Do not print secret values in workflow logs.
Trivy Security Scanning

The workflow uses Trivy to scan the Docker image for vulnerabilities.

- name: Scan Docker image with Trivy
  uses: aquasecurity/trivy-action@0.35.0
  with:
    image-ref: ${{ env.IMAGE_NAME }}:${{ github.sha }}
    format: table
    exit-code: '0'
    severity: HIGH,CRITICAL
Current mode

The workflow currently runs Trivy in report-only mode:

exit-code: '0'

This means Trivy reports HIGH and CRITICAL vulnerabilities but does not fail the workflow.

Strict security gate mode

For production-style enforcement, change:

exit-code: '0'

to:

exit-code: '1'

This will fail the workflow if HIGH or CRITICAL vulnerabilities are found.

Job 3: Summary

The summary job runs after the Docker build job completes successfully.

It creates a CI summary report:

reports/ci-summary.txt

The report includes:

Repository
Commit SHA
Workflow name
Docker image tag

The file is uploaded as a GitHub Actions artifact using:

- name: Upload CI summary artifact
  uses: actions/upload-artifact@v4
  with:
    name: ci-summary-report
    path: reports/ci-summary.txt
Artifacts

Artifacts are files generated during a workflow run that are saved after the runner finishes.

This workflow uploads:

ci-summary-report

Artifacts are useful for:

Test reports
Logs
Build outputs
Coverage reports
Deployment packages
CI summary files
Environment Variables

The workflow uses environment variables to avoid repeating values.

Workflow-level variables:

env:
  APP_NAME: github-actions-docker-cicd
  NODE_VERSION: '22'

Job-level variable example:

env:
  IMAGE_NAME: ${{ secrets.DOCKERHUB_USERNAME }}/github-actions-docker-cicd
Variable syntax
Syntax	Used for
$APP_NAME	Shell variable inside run commands
${{ env.NODE_VERSION }}	GitHub Actions expression
${{ secrets.DOCKERHUB_TOKEN }}	GitHub secret
${{ github.sha }}	GitHub context value
Key GitHub Actions Concepts Demonstrated

This project demonstrates:

Workflow YAML structure
GitHub Actions triggers
Pull request checks
Manual workflow trigger
Jobs and steps
uses vs run
GitHub-hosted runners
Node.js setup
Environment variables
Repository secrets
Conditional steps
Job dependencies using needs
Docker image build
Docker image tagging
Docker container runtime validation
Docker Hub login
Docker image push
Trivy image scanning
Artifact upload
CI/CD Concepts Demonstrated

This project demonstrates a practical CI/CD flow:

Stage	Purpose
Source control	Code pushed or PR opened in GitHub
CI trigger	GitHub Actions workflow starts automatically
Test	Application dependencies installed and tests executed
Build	Docker image created
Validate	Container is run to confirm the image starts
Security scan	Docker image scanned with Trivy
Registry login	Docker Hub login using GitHub Secrets
Publish	Docker image pushed to Docker Hub
Artifact	CI summary report uploaded