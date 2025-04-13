const docker = require("dockerode");
const db = require("../db.js");
const dockerClient = new docker();

// Function to create a Docker container for Nginx
async function createNginxContainer(containerName, userId, ports) {
  try {
    const container = await dockerClient.createContainer({
      Image: "nginx:latest", // Use the latest Nginx image
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

    db.run(
      `INSERT INTO containers (user_id, container_name, image, ports) VALUES (?, ?, ?, ?)`,
      [userId, containerName, "nginx:latest", JSON.stringify(ports)],
      (err) => {
        if (err) {
          console.error("Error saving container to database:", err.message);
        } else {
          console.log(
            `Container ${containerName} associated with user ${userId}`
          );
        }
      }
    );

    return container;
  } catch (error) {
    console.error("Error creating Nginx container:", error);
    throw error;
  }
}

// Function to list all containers for a specific user
function listUserContainers(userId, callback) {
  db.all(
    `SELECT * FROM containers WHERE user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error(
          "Error retrieving containers from database:",
          err.message
        );
        callback(err, null);
      } else {
        callback(null, rows);
      }
    }
  );
}

module.exports = {
  createNginxContainer,
  listUserContainers,
};
