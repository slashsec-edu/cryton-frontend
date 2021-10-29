export interface CrytonResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}
