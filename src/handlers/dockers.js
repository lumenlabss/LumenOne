const docker = require("dockerode");
const db = require("../db.js");
const fs = require("fs");
const path = require("path");
const dockerClient = new docker();
const { exec } = require("child_process");

// Function to create a Docker container
async function createContainer(containerName, imageName, ports) {
  try {
    const container = await dockerClient.createContainer({
      Image: imageName,
      name: containerName,
      ExposedPorts: ports,
      HostConfig: {
        PortBindings: Object.keys(ports).reduce((acc, port) => {
          acc[port] = [{ HostPort: ports[port] }];
          return acc;
        }, {}),
      },
    });
    await container.start();
    return container;
  } catch (error) {
    console.error("Error creating container:", error);
    throw error;
  }
}

// Function to list all Docker containers
