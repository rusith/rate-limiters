import RuleProvider from "./abstract/rule-provider";
import UserIdGenerator from "./abstract/user-id-generator";

class Bucket {
  private tokenCount: number;
  private lastRefillTime: number;

  constructor(private readonly capacity: number) {
    this.tokenCount = capacity;
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
    if (difference > 1000) {
      this.tokenCount = this.capacity;
      this.lastRefillTime = new Date().getTime();
    }
  }
}

export default class TokenBucketRateLimiter<TReq> {
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
        (bucket = new Bucket(
          this.ruleProvider.getRuleForUser(userId).requestsPerSecond
        ))
      );
    } else {
      bucket = this.buckets.get(userId)!;
    }

    return bucket.shoudlHandle();
  }
}
