const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
const ecsClient = new ECSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

const config = {
  CLUSTER: process.env.CLUSTER,
  TASK: process.env.TASK_DEFINITION,
};
app.use(express.json());

app.post("/", async (req, res) => {
  const { giturl } = req.body;
  const projectSlug = generateSlug();
  try {
    const command = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: [
            process.env.SUBNET1,
            process.env.SUBNET2,
            process.env.SUBNET3,
            process.env.SUBNET4,
            process.env.SUBNET5,
            process.env.SUBNET6,
          ],
          securityGroups: [process.env.SECURITY_GROUP],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builde-server-image",
            environment: [
              { name: "GIT_REPO_URL", value: giturl },
              { name: "PROJECT_ID", value: projectSlug },
              { name: "accessKeyId", value: process.env.accessKeyId },
              { name: "secretAccessKey", value: process.env.secretAccessKey },
            ],
          },
        ],
      },
    });

    let someres = await ecsClient.send(command);
    console.log(JSON.stringify(someres, null, 2));
    return res.json({
      status: "queued",
      projectSlug,
      url: `http://${projectSlug}.localhost:8000`,
    });
  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
