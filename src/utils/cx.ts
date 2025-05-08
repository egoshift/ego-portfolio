export function cx(...args: (string | undefined | null | false)[]): string {
  return args.filter(Boolean).join(' ');
}