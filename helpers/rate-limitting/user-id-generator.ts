export default interface UserIdGenerator<T> {
  generate(request: T): string;
}