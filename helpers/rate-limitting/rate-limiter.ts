export default interface RateLimiter<T> {
  shouldHandleRequest(req: T): boolean;
}
