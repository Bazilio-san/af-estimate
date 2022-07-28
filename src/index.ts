const { formatMilliseconds } = require('af-fns');
const echo = require('af-echo');

const { reset, colorMagenta: magenta } = echo;

export interface IEstimatePrintOptions {
  showPercent: boolean,
  showCount: boolean,
  showTakenTime: boolean,
  roll: number,
  prefix: string,
  msg: string,
  of?: {
    text: string,
    processed: number | null,
    total: number | null
  }
}

export interface TEchoOptions {
  colorNum?: number,
  bgColorNum?: number,
  bold?: boolean,
  underscore?: boolean,
  reverse?: boolean,
  prefix?: string,
  consoleFunction?: 'dir' | 'log',
  logger?: any,
  estimate?: any,
  estimateReset?: boolean,
  prettyJSON?: boolean,
  linesBefore?: number,
}

export class Estimate {
  public startTime: number;

  public startCircleTime: number;

  public echo: any;

  constructor (public total?: number) {
    this.startTime = +new Date();
    this.startCircleTime = +new Date();
    this.echo = echo;
  }

  startProgress (total: number, roll: number = 0, msgAdd: string = '', echoLevel: number = 2) {
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

  setTotal (total: number) {
    this.total = total;
  }

  print (processed: number, options: string | IEstimatePrintOptions) {
    const defaultOptions: IEstimatePrintOptions = {
      showPercent: true,
      showCount: true,
      showTakenTime: true,
      roll: 0,
      prefix: '',
      msg: '',
    };
    if (typeof options === 'string') {
      defaultOptions.msg = options;
      options = defaultOptions;
    } else {
      options = Object.assign(defaultOptions, options);
    }
    if (!this.total) {
      echo.echo(`"Estimate": can't calculate time, "total" parameter is not set`);
      return;
    }

    const txtOf = options.of?.text || '';
    const txtProcessed = options.of?.processed || processed;
    const txtTotal = options.of?.total || this.total;
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
    const processedTime = options.showTakenTime ? `${reset} / 🕒 ${magenta}${this.getTaken()} ${reset}` : '';
    const roll = options.roll || 0;
    const msgAdd = options.msg || '';

    const msg = `${reset}${options.prefix || ''}Processed ${processedString}${reset}. ${leftString}${processedTime}${msgAdd ? `${reset} / ${msgAdd}` : ''} `;
    if (process.stdin.isTTY && roll) {
      process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
    } else {
      echo.echo(msg);
    }
  }

  getTaken (isReset: boolean = false, isShowMilliseconds: boolean = false): string {
    const taken = formatMilliseconds(+new Date() - this.startTime, isShowMilliseconds) as string;
    if (isReset) {
      this.reset();
    }
    return taken;
  }

  getRest (processed: number, fromStart?: boolean): string {
    if (processed && this.total) {
      const msLeft = (+new Date() - (fromStart ? this.startTime : this.startCircleTime)) * ((this.total / processed) - 1);
      return formatMilliseconds(msLeft) as string;
    }
    return '';
  }

  taken (roll?: number, msgAdd?: string, options?: TEchoOptions): void {
    const msg = `${reset}Time spent: ${magenta}${this.getTaken()}${msgAdd ? `${reset} / ${msgAdd}` : ''}`;
    if (process.stdin.isTTY && roll) {
      process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
    } else {
      echo.echo(msg, options);
    }
  }

  reset (): void {
    this.startTime = +new Date();
    this.startCircleTime = +new Date();
  }
}
