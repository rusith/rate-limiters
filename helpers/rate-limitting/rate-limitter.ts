export default interface RateLimitter<T> {
  shouldHandleRequest(req: T): boolean;
}
