const readline = require('readline');

module.exports = {
  info: function(msg) {
    this.__progress_clear();
    process.stdout.write(msg + '\n');
  },
  error: function(msg) {
    this.__progress_clear();
    process.stdout.write('[ERROR]: ' + msg + '\n');
  },
  __progress_spinner: ['|', '/', '-', '*'],
  __progress_clear: function() {
    if (this.__progress) {
      process.stdout.write('\n');
      delete this.__progress;
    }
  },
  progress: function(msg) {
    if (this.__progress !== undefined) {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
    } else {
      this.__progress = (this.__progress || 0);
    }
    const spinIdx = this.__progress % this.__progress_spinner.length;
    const spinChar = this.__progress_spinner[spinIdx];
    process.stdout.write('[' + spinChar + '] ' + msg);
    this.__progress++;
  }
};
