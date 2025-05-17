import { createConsola } from "consola";

export const isProduction = () => false;

export const logger = createConsola({
  level: !isProduction() ? 999 : -999,
  formatOptions: {
    columns: 80,
    colors: false,
    compact: false,
    date: false,
  },
});

logger.wrapConsole()