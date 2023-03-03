import express from "express";
import cors from "cors";
import TokenBucketRateLimiter from "./helpers/rate-limitting/concrete/token-bucket-rate-limitter";
import { FixedWindowRateLimitter } from "./helpers/rate-limitting/concrete/fixed-window-rate-limitter";
import UserIdGenerator from "./helpers/rate-limitting/user-id-generator";
import RuleProvider from "./helpers/rate-limitting/rule-provider";

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

const tokenBucketRateLimitter = new TokenBucketRateLimiter(
  userIdGenerator,
  ruleProvider
);

const fixedWindowRateLimitter = new FixedWindowRateLimitter(
  userIdGenerator,
  ruleProvider
);

app.use((req, res, next) => {
  if (fixedWindowRateLimitter.shouldHandleRequest(req)) {
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
