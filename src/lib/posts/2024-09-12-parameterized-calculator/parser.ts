import Fraction from 'fraction.js';
import type { Node } from 'ohm-js';

import arithmeticGrammar from './arithmetic.ohm-bundle';
import { Value } from './value';

export { arithmeticGrammar };

export const calcSemantics = arithmeticGrammar.createSemantics();

const textWithSpace = function (...children: Node[]) {
  return children.map((x) => x.text()).join(' ');
};

const textWithoutSpace = function (...children: Node[]) {
  return children.map((x) => x.textWithoutSpace()).join('');
};

const textWithoutSpace1 = (a: Node) => textWithoutSpace(a);
const textWithoutSpace2 = (a: Node, b: Node) => textWithoutSpace(a, b);
const textWithoutSpace3 = (a: Node, b: Node, c: Node) => textWithoutSpace(a, b, c);

calcSemantics.addOperation('textWithoutSpace', {
  _terminal() {
    return this.sourceString;
  },
  _nonterminal: textWithoutSpace,
  _iter: textWithoutSpace,
});

calcSemantics.addOperation('textWithSpace', {
  _terminal() {
    return this.sourceString;
  },
  _nonterminal: textWithSpace,
  _iter: textWithSpace,
});

calcSemantics.addOperation('text', {
  _terminal() {
    return this.sourceString;
  },
  _nonterminal: textWithSpace,
  _iter: textWithSpace,

  number_fract: textWithoutSpace3,
  number_whole: textWithoutSpace1,
  ident: textWithoutSpace2,
});

calcSemantics.addAttribute<Value>('value', {
  number_fract(_arg0, _arg1, _arg2) {
    return new Value(new Fraction(this.sourceString));
  },

  number_whole(_arg0) {
    return new Value(new Fraction(this.sourceString));
  },

  ident(_arg0, _arg1) {
    return new Value(new Fraction('1'));
  },

  AddExp_plus(arg0, _arg1, arg2) {
    return arg0.value.add(arg2.value);
  },

  AddExp_minus(arg0, _arg1, arg2) {
    return arg0.value.add(arg2.value.neg());
  },

  MulExp_times(arg0, _arg1, arg2) {
    return arg0.value.mul(arg2.value);
  },

  SMulExp_shortTimes(arg0, arg1) {
    return arg0.value.mul(arg1.value);
  },

  MulExp_divide(arg0, _arg1, arg2) {
    return arg0.value.div(arg2.value);
  },

  ExpExp_power(arg0, _arg1, arg2) {
    return arg0.value.exp(arg2.value);
  },

  ExpExp_powerRSign(arg0, _arg1, arg2) {
    return arg0.value.exp(arg2.value);
  },

  PriExp_paren(_arg0, arg1, _arg2) {
    return arg1.value;
  },

  SignExp_pos(_arg0, arg1) {
    return arg1.value;
  },

  SignExp_neg(_arg0, arg1) {
    return arg1.value.neg();
  },
});

type Result = { ok: true; value: Value } | { ok: false; error: string };

export function parseValue(s: string): Result {
  const m = arithmeticGrammar.match(s);
  if (m.failed()) return { ok: false, error: `Cannot parse "${s}"` };
  const r = calcSemantics(m);
  const value: Value = r.value;

  if (value.invalidReason) {
    return { ok: false, error: `Invalid expression ${s}: ${value.invalidReason}` };
  }

  return { ok: true, value };
}
