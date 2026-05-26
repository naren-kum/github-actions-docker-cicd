function getHealthStatus() {
  return {
    status: "ok",
    service: "github-actions-docker-cicd"
  };
}

if (require.main === module) {
  console.log(JSON.stringify(getHealthStatus()));
}

module.exports = { getHealthStatus };
