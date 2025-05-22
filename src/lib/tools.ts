import { logger } from "./consola";

class ToolsBus {
  private observers: Map<string, () => void> = new Map();

  public subscribe(toolName: string, callBack: () => void) {
    console.debug('subscribing for ', toolName)
    this.observers.set(toolName, callBack);
  }

  public complete(toolName: string) {
    console.debug('completed', toolName)
    try {
      this.observers.get(toolName)?.();
      this.observers.delete(toolName);
    } catch (e) {
      logger.error(e);
    }
  }
}

export const toolsBus = new ToolsBus();