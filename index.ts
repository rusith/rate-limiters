import express from "express";
import cors from "cors";
import TokenBucketRateLimiter from "./helpers/rate-limiting/concrete/token-bucket-rate-limiter";
import FixedWindowRateLimiter from "./helpers/rate-limiting/concrete/fixed-window-rate-limiter";
import SlidingWindowRateLimiter from "./helpers/rate-limiting/concrete/sliding-window-rate-limiter";
import UserIdGenerator from "./helpers/rate-limiting/user-id-generator";
import RuleProvider from "./helpers/rate-limiting/rule-provider";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const userIdGenerator: UserIdGenerator<express.Request> = {
  generate: (req) => req.ip,
};

const ruleProvider: RuleProvider = {
  getRuleForUser: (userId) => ({ per: "min", reqests: 10 }),
};

const tokenBucketRateLimiter = new TokenBucketRateLimiter(
  userIdGenerator,
  ruleProvider
);

const fixedWindowRateLimiter = new FixedWindowRateLimiter(
  userIdGenerator,
  ruleProvider
);

const slidingWindowRateLimiter = new SlidingWindowRateLimiter(
  userIdGenerator,
  ruleProvider
);

app.use((req, res, next) => {
  if (slidingWindowRateLimiter.shouldHandleRequest(req)) {
    next();
  } else {
    res.status(429).send("Too many requests");
  }
});

app.get("/data", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ data: "Hello World" }));
});

app.listen(PORT, () => console.log("SERVER IS RUNNING ON PORT " + PORT));
