const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const app = express();
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
dotenv.config();
const port = process.env.PORT;
const socketPort = 9002;
const { Server } = require("socket.io");

const redisIntance = require("ioredis");
const subscriber = new redisIntance(process.env.REDIS_CONNECTION_STRING);

const socketServer = http.createServer();
// const io = new Server(socketServer, { cors: "*" });

const io = new Server({ cors: "*" });

io.on("connection", (socket) => {
  console.log("a user connected asking for logs");
  socket.on("subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
    console.log("socket connected");
  });
});

io.listen(9002, () => console.log("Socket Server 9002"));

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/deploy", async (req, res) => {
  const { giturl, slug } = req.body;

  const projectSlug = slug ? slug : generateSlug();

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
              {
                name: "REDIS_CONNECTION_STRING",
                value: process.env.REDIS_CONNECTION_STRING,
              },
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
async function initRedisSubscribe() {
  console.log("subscribed to logs:PROJECT_ID");
  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage", (pattern, channel, message) => {
    // const [,projectId] = channel.split(":")
    io.to(channel).emit("message", message);
  });
}
initRedisSubscribe();
app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
