const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
const port = process.env.PORT || 8000;

const baseURI = "https://swarnnika-vercel2.s3.amazonaws.com/__output";
const proxy = httpProxy.createProxy();

// Proxy middleware
app.use((req, res, next) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];
  const resolveURI = `${baseURI}/${subdomain}`;
  proxy.web(req, res, { target: resolveURI, changeOrigin: true }, (err) => {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error");
  });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url == "/") {
    proxyReq.path += "index.html";
    return proxyReq;
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Internal server error:", err);
  res.status(500).send("Internal server error");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
