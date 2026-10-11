const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logFilePath() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `app-${date}.log`);
}

function formatLine(level, message, meta) {
  const timestamp = new Date().toISOString();
  const extra = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${extra}\n`;
}

function write(level, message, meta) {
  ensureLogDir();
  const line = formatLine(level, message, meta);

  try {
    fs.appendFileSync(logFilePath(), line, 'utf8');
  } catch (err) {
    console.error('Failed to write log file:', err.message);
  }

  if (level === 'ERROR') {
    console.error(message, meta || '');
  } else if (level === 'WARN') {
    console.warn(message, meta || '');
  } else {
    console.log(message);
  }
}

const logger = {
  info: (message, meta) => write('INFO', message, meta),
  warn: (message, meta) => write('WARN', message, meta),
  error: (message, meta) => write('ERROR', message, meta),
};

module.exports = logger;
