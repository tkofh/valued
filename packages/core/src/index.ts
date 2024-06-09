import { oneOf } from './combinator/oneOf'
import { someOf } from './combinator/someOf'
import { keyword } from './data/keyword'

// const _boxShadow = juxtapose([optional(keyword('inset')), dimension(['px'])])

/**
 * box-shadow =
 *   <spread-shadow>#
 *
 * <spread-shadow> =
 *   <'box-shadow-color'>?                               &&
 *   [ <'box-shadow-offset'> [ <'box-shadow-blur'> <'box-shadow-spread'>? ]? ]  &&
 *   <'box-shadow-position'>?
 *
 * <box-shadow-color> =
 *   <color>#
 *
 * <box-shadow-offset> =
 *   [ none | <length>{2} ]#
 *
 * <box-shadow-blur> =
 *   <length [0,∞]>#
 *
 * <box-shadow-spread> =
 *   <length>#
 *
 * <box-shadow-position> =
 *   [ outset | inset ]#
 */

const _test = oneOf([keyword('foo'), someOf([keyword('bar'), keyword('baz')])])
