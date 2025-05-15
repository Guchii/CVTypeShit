export interface JQ {
  invoke(input: string, filter: string, options?: string[]): Promise<string>
}

export function newJQ(module?: object): Promise<JQ>;

export default newJQ;
