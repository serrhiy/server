'use strict';

const util = require('node:util');

const DATETIME_LENGTH = 19;

class Logger {
  #stream = null;
  
  constructor(stream = process.stdout) {
    this.#stream = stream;
  }

  close() {
    return new Promise((resolve) => this.#stream.end(resolve));
  }

  log(...args) {
    const string = util.format(...args);
    const now = new Date().toISOString();
    const date = now.substring(0, DATETIME_LENGTH);
    const line = date + '\t' + string;
    const out = line.replace(/[\n\r]\s*/g, '; ') + '\n';
    this.#stream.write(out);
  }
}

module.exports = Logger;
