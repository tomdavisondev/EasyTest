const winston = require('winston');

class Logger {
  constructor() {
    const getColorizedLine = (line, level) => {
      let colorCode = '\x1b[0m'; // Reset color

      switch (level) {
        case 'error':
          colorCode = '\x1b[31m'; // Red
          break;
        case 'warn':
          colorCode = '\x1b[33m'; // Yellow
          break;
        case 'info':
          colorCode = '\x1b[32m'; // Green
          break;
        case 'verbose':
          colorCode = '\x1b[35m'; // Purple
          break;
        case 'debug':
          colorCode = '\x1b[34m'; // Blue
          break;
      }

      const resetColor = '\x1b[0m'; // Reset color
      return `${colorCode}${line}${resetColor}`;
    };

    const alignColorsAndTime = winston.format.combine(
      winston.format.label({
        label: '[LOGGER]',
      }),
      winston.format.timestamp({
        format: 'YY-MM-DD HH:mm:ss',
      }),
      winston.format.printf((info) => {
        const line = ` ${info.label}  ${info.timestamp}  ${info.level}: ${info.message}`;
        return getColorizedLine(line, info.level);
      })
    );

    this.userLogger = winston.createLogger({
      level: 'debug',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'logs/user.log' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: alignColorsAndTime,
        }),
      ],
    });

    this.serverLogger = winston.createLogger({
      level: 'debug',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'logs/server.log' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: alignColorsAndTime,
        }),
      ],
    });
  }

  user(severity, message) {
    this.userLogger.log({ level: severity, message: message });
  }

  server(severity, message) {
    this.serverLogger.log({ level: severity, message: message });
  }
}

module.exports = new Logger();
