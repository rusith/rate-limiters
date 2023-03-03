import RateLimitter from "../rate-limitter";
import RuleProvider from "../rule-provider";
import UserIdGenerator from "../user-id-generator";

export default class SlidingWindowRateLimitter<T> implements RateLimitter<T> {
  private readonly userWindows = new Map<string, number[]>();

  constructor(
    private readonly userIdGenerator: UserIdGenerator<T>,
    private readonly ruleProvider: RuleProvider
  ) {}

  shouldHandleRequest(req: T): boolean {
    const userId = this.userIdGenerator.generate(req);
    let userWindow: number[];

    if (this.userWindows.has(userId)) {
      userWindow = this.userWindows.get(userId)!;
    } else {
      this.userWindows.set(userId, (userWindow = []));
    }

    const rule = this.ruleProvider.getRuleForUser(userId);
    const amount = rule.per === "sec" ? 1000 : 60000;
    const from = new Date().getTime() - amount;
    const count = this.count(userWindow, from);

    userWindow.push(new Date().getTime());

    return count < rule.reqests;
  }

  private count(list: number[], until: number) {
    let count = 0;
    let i = list.length - 1;
    while (i >= 0) {
      if (list[i] >= until) {
        count++;
      } else {
        break;
      }
      i--;
    }

    return count;
  }
}
