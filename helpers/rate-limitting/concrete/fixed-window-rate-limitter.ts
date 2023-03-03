import RateLimitter from "../rate-limitter";
import RuleProvider from "../rule-provider";
import UserIdGenerator from "../user-id-generator";

export default class FixedWindowRateLimitter<T> implements RateLimitter<T> {
  private readonly userWindows = new Map<string, Map<number, number>>();

  constructor(
    private readonly userIdGenretor: UserIdGenerator<T>,
    private readonly ruleProvider: RuleProvider
  ) {}

  shouldHandleRequest(req: T): boolean {
    const userId = this.userIdGenretor.generate(req);
    let userWindow: Map<number, number>;

    if (!this.userWindows.has(userId)) {
      this.userWindows.set(userId, (userWindow = new Map()));
    } else {
      userWindow = this.userWindows.get(userId)!;
    }

    const rule = this.ruleProvider.getRuleForUser(userId);

    const thisWindow = Math.floor(
      new Date().getTime() / (rule.per === "sec" ? 1000 : 60000)
    );

    if (userWindow.has(thisWindow)) {
      if (userWindow.get(thisWindow)! >= rule.reqests) {
        return false;
      }
      userWindow.set(thisWindow, userWindow.get(thisWindow)! + 1);
      return true;
    } else {
      userWindow.clear();
      userWindow.set(thisWindow, 1);
      return true;
    }
  }
}
