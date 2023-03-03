export interface Rule {
  per: "min" | "sec";
  reqests: number;
}

export default interface RuleProvider {
  getRuleForUser(userId: string): Rule;
}
