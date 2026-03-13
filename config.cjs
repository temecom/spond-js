
const common = {
  logLevel: 'INFO', // Default log level
};

module.exports = {
  development: {
    ...common,
    platform: {
      name: 'gas',
      deploymentId: 'AKfycbxjR-rxzS5DbyIekcTbGbA6WinDmjBlSMEfWPjxE6ObbQLVNvyNx86fwMX2pu4BVmmL',
    },
    version: 'SNAPSHOT-0.1.0',
  },
  production: {
    ...common,
    // Production configuration
    // This is the configuration used in the live environment
    // It should be updated with the latest stable version and deployment ID
    // Ensure to update this when deploying new changes
    platform: {
      name: 'gas',
      deploymentId: 'AKfycbyBxinKd-rRq3W5ggM2iH_FGe9seacTgJqjQ3N3LpGd-pIvt7hoFz8RBEjgkNAGnLUI',
    },
    version: 'RELEASE-1.2.10',
  },
  test: {
    ...common,
    platform: {
      name: 'node',
    },
    version: 'TEST-0.0.0',
    logLevel: 'INFO', // Override for tests
  }

};
