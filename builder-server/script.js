const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const redisIntance = require("ioredis");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const PROJECT_ID = process.env.PROJECT_ID;
const mime = require("mime-types");
const publisher = new redisIntance(process.env.REDIS_CONNECTION_STRING);
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

function logPublisher(log) {
  publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify(log));
}
async function init() {
  console.log("excuting script.js");
  logPublisher("building started...");
  const outDirPath = path.join(__dirname, "output");
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);
  p.stdout.on("data", function (data) {
    console.log(data.toString());
    logPublisher(data.toString());
  });

  p.stdout.on("error", function (data) {
    console.log("Error", data.toString());
    logPublisher(`"Error", ${data.toString()}`);
  });
  p.on("close", async function () {
    console.log("Build complete");
    const disfolderpath = path.join(__dirname, "output", "build");
    const disfoldercontents = fs.readdirSync(disfolderpath, {
      recursive: true,
    });
    logPublisher("file scanner started");
    for (const file of disfoldercontents) {
      const filePath = path.join(disfolderpath, file);
      console.log(filePath, "i am file path");
      logPublisher(`processing.., ${file}`);
      if (fs.lstatSync(filePath).isDirectory()) {
        continue;
      }
      console.log("uploading", filePath);
      try {
        const command = new PutObjectCommand({
          Bucket: "swarnnika-vercel2",
          Key: `__output/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mime.lookup(filePath),
        });
        await s3Client.send(command);
        console.log("uploaded");
      } catch (err) {
        console.log(err, "error from upload");
      }
    }
  });
  logPublisher(`Build Completed...`);
  console.log("Done...");
}
init();
