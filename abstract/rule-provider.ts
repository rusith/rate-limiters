interface Rule {
  requestsPerSecond: number;
}

export default interface RuleProvider {
  getRuleForUser(userId: string): Rule;
}