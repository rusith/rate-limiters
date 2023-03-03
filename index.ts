import express from "express";
import cors from "cors";
import TokenBucketRateLimiter from "./helpers/rate-limitting/concrete/token-bucket-rate-limitter";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const rateLimitter = new TokenBucketRateLimiter(
  {
    generate: (req: express.Request) => req.ip,
  },
  {
    getRuleForUser: () => ({ requestsPerSecond: 1 }),
  }
);

app.use((req, res, next) => {
  if (rateLimitter.shouldHandleRequest(req)) {
    next();
  } else {
    res.status(429).send("Too many requests");
  }
});

app.get("/data", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ data: "Hello World" }));
});

app.listen(PORT, () => console.log("SERVER IS RUNNING ON PORT " + PORT));
