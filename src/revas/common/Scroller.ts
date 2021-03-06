import { RevasTouchEvent } from '../core/Node'
import { clamp } from '../core/utils'

export default class Scroller {
  top = 0

  constructor(
    private handler: (top: number) => any,
    public max = -1
  ) { }

  private _lastY = -1
  private _lastTimestamp = 0
  private _v = 0
  private _tid = 0

  touchStart = (e: RevasTouchEvent) => {
    this._tid = +Object.keys(e.touches)[0]
    this._lastTimestamp = e.timestamp
    this._lastY = e.touches[this._tid].y
  }

  touchMove = (e: RevasTouchEvent) => {
    const { y } = e.touches[this._tid]
    const moveY = this._lastY - y
    const duration = e.timestamp - this._lastTimestamp
    this._v = moveY / duration
    this._lastTimestamp = e.timestamp
    this._lastY = y
    this.change(moveY)
  }

  touchEnd = (e: RevasTouchEvent) => {
    this._lastTimestamp = Date.now()
    this._lastY = -1
    requestAnimationFrame(this.afterEnd)
  }

  afterEnd = () => {
    if (this._lastY < 0 && Math.abs(this._v) > 0.1) {
      const timestamp = Date.now()
      const duration = timestamp - this._lastTimestamp
      this._v = friction(this._v, duration)
      const moveY = this._v * duration
      this._lastTimestamp = timestamp
      this.change(moveY)
      requestAnimationFrame(this.afterEnd)
    }
  }

  change(top: number) {
    const _top = clamp(this.top + top, 0, this.max > 0 ? this.max : 0)
    // check validate
    if (_top !== this.top) {
      this.top = _top
      this.handler(this.top)
    } else if (this._lastY < 0) {
      this._v = 0
    }
  }
}

function friction(v: number, duration: number) {
  return v - (duration * 0.005 * v)
}