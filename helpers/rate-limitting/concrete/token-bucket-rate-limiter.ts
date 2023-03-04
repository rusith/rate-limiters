import RateLimiter from "../rate-limiter";
import RuleProvider, { Rule } from "../rule-provider";
import UserIdGenerator from "../user-id-generator";

class Bucket {
  private tokenCount: number;
  private lastRefillTime: number;

  constructor(private readonly rule: Rule) {
    this.tokenCount = rule.reqests;
    this.lastRefillTime = new Date().getTime();
  }

  public shoudlHandle() {
    this.refill();
    if (this.tokenCount > 0) {
      this.tokenCount--;
      return true;
    } else {
      return false;
    }
  }

  private refill() {
    const difference = new Date().getTime() - this.lastRefillTime;
    if (difference > (this.rule.per === "sec" ? 1000 : 60000)) {
      this.tokenCount = this.rule.reqests;
      this.lastRefillTime = new Date().getTime();
    }
  }
}

export default class TokenBucketRateLimiter<TReq> implements RateLimiter<TReq> {
  constructor(
    private readonly userIdGenerator: UserIdGenerator<TReq>,
    private readonly ruleProvider: RuleProvider
  ) {}

  private readonly buckets = new Map<string, Bucket>();

  public shouldHandleRequest(req: TReq): boolean {
    const userId = this.userIdGenerator.generate(req);

    let bucket: Bucket;
    if (!this.buckets.has(userId)) {
      this.buckets.set(
        userId,
        (bucket = new Bucket(this.ruleProvider.getRuleForUser(userId)))
      );
    } else {
      bucket = this.buckets.get(userId)!;
    }

    return bucket.shoudlHandle();
  }
}
