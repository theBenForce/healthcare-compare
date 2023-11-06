/* eslint-disable @typescript-eslint/no-explicit-any */

const LogLevels = ['verbose', 'info', 'warn', 'error'];

const isLevelActive = (level: 'verbose' | 'info' | 'warn' | 'error') => {
  return LogLevels.indexOf(level) >= LogLevels.indexOf(Logger.level);
}

export class Logger {
  static get level() {
    return import.meta.env.VITE_LOG_LEVEL ?? 'warn';
  }

  static dir(...args: any[]) {
    if(!isLevelActive('verbose')) return;
    console.dir(...args);
  }

  static verbose(...args: any[]) {
    if(!isLevelActive('verbose')) return;
    console.log(...args);
  }

  static info(...args: any[]) {
    if(!isLevelActive('info')) return;
    console.info(...args);
  }

  static warn(...args: any[]) {
    if(!isLevelActive('warn')) return;
    console.warn(...args);
  }

  static error(...args: any[]) {
    if(!isLevelActive('error')) return;
    console.error(...args);
  }
}