export default class Timeout {
  id: number;
  handler: TimerHandler;
  start: number;
  timeLeft: number;
  constructor(handler: TimerHandler, time: number) {
    this.id = setTimeout(handler, time);
    this.handler = handler;
    this.start = Date.now();
    this.timeLeft = time;
  }

  clear() {
    clearTimeout(this.id);
  }

  pause() {
    const elapsedTime = Date.now() - this.start;
    this.timeLeft = this.timeLeft - elapsedTime;
    this.clear();
  }

  continue() {
    this.clear();
    this.id = setTimeout(this.handler, this.timeLeft);
    this.start = Date.now();
  }
}
