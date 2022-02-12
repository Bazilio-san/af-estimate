const { formatMilliseconds } = require('af-fns');
const echo = require('af-echo');

const { reset, colorMagenta: magenta } = echo;

class Estimate {
  constructor (total) {
    this.total = total;
    this.startTime = +new Date();
    this.startCircleTime = +new Date();
    this.echo = echo;
  }

  startProgress (total, roll = 0, msgAdd = undefined, echoLevel = 2) {
    this.total = total;
    this.startCircleTime = +new Date();
    const msg = `${reset}Time taken to start processing: ${magenta}${
      formatMilliseconds(+new Date() - this.startTime)}${msgAdd ? `${reset} / ${msgAdd}` : ''}`;
    if (process.stdin.isTTY && roll) {
      process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
    } else {
      echo.log(echoLevel, msg);
    }
  }

  setTotal (total) {
    this.total = total;
  }

  print (processed, options) {
    const defaultOptions = {
      showPercent: true,
      showCount: true,
      showTakenTime: true,
      roll: 0,
      msg: '',
      of: null, // {text: '', processed: null,  total: null}
    };
    if (typeof options === 'string') {
      defaultOptions.msg = options;
      options = defaultOptions;
    } else {
      options = Object.assign(defaultOptions, options);
    }
    if (!this.total) {
      echo.echo(`"Estimate": can't calculate time, "total" parameter is not set`, 0);
      return;
    }

    const txtOf = (options.of && options.of.text) || '';
    const txtProcessed = (options.of && options.of.processed) || processed;
    const txtTotal = (options.of && options.of.total) || this.total;
    let processedString = options.showPercent ? `${magenta}${Math.ceil((txtProcessed / txtTotal) * 100)}${reset}%` : '';
    const countString = options.showCount ? `${txtOf}${magenta}${txtProcessed} ${reset}out of ${magenta}${txtTotal}` : '';
    processedString += (processedString ? ' (' : '') + countString + (processedString ? `${reset})` : '');
    let leftString = `${reset}Left: ${magenta}`;
    if (processed) {
      const msLeft = (+new Date() - this.startCircleTime) * ((this.total / processed) - 1);
      leftString += formatMilliseconds(msLeft);
    } else {
      leftString = '';
    }
    const processedTime = options.showTakenTime ? `${reset} / Прошло ${magenta}${this.getTaken()} ${reset}` : '';
    const roll = options.roll || 0;
    const msgAdd = options.msg || '';
    const msg = `${reset}Processed ${processedString}${reset}. ${leftString}${processedTime}${msgAdd ? `${reset} / ${msgAdd}` : ''} `;
    if (process.stdin.isTTY && roll) {
      process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
    } else {
      echo.echo(msg, 0);
    }
  }

  getTaken (isReset = false, isShowMilliseconds = false) {
    const taken = formatMilliseconds(+new Date() - this.startTime, isShowMilliseconds);
    if (isReset) {
      this.reset();
    }
    return taken;
  }

  getRest (processed, fromStart) {
    if (processed && this.total) {
      const msLeft = (+new Date() - (fromStart ? this.startTime : this.startCircleTime)) * ((this.total / processed) - 1);
      return formatMilliseconds(msLeft);
    }
    return '';
  }

  taken (roll = 0, msgAdd = '', options = undefined) {
    const msg = `${reset}Time spent: ${magenta}${this.getTaken()}${msgAdd ? `${reset} / ${msgAdd}` : ''}`;
    if (process.stdin.isTTY && roll) {
      process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
    } else {
      echo.echo(msg, options);
    }
  }

  reset () {
    this.startTime = +new Date();
    this.startCircleTime = +new Date();
  }
}

module.exports = Estimate;
