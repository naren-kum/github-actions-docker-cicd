const { getHealthStatus } = require("../src/app");

const result = getHealthStatus();

if (result.status !== "ok") {
  throw new Error("Expected status to be ok");
}

if (result.service !== "github-actions-docker-cicd") {
  throw new Error("Unexpected service name");
}

console.log("All tests passed");
