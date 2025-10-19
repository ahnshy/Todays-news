declare module 'content-type' {
  export interface ParsedMediaType { type: string; parameters: Record<string,string>; }
  export function parse(input: string): ParsedMediaType;
}
