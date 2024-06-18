const infinity = '∞'

export class InternalNumberParser {
  readonly #min: number | false
  readonly #max: number | false

  constructor(min: number | false = false, max: number | false = false) {
    this.#min = min
    this.#max = max
  }

  parse(input: string): number | false {
    const value = Number(input)

    if (Number.isNaN(value)) {
      return false
    }

    if (this.#min !== false && value < this.#min) {
      return false
    }

    if (this.#max !== false && value > this.#max) {
      return false
    }

    return value
  }

  toString(label = 'number') {
    if (this.#min === false && this.#max === false) {
      return `<${label}>`
    }

    return `<${label} [${this.#min === false ? `-${infinity}` : String(this.#min)}, ${this.#max === false ? infinity : String(this.#max)}]>`
  }
}
