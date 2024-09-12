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

calcSemantics.addOperation<Value>('value(variables)', {
  number_fract(_arg0, _arg1, _arg2) {
    return new Value(new Fraction(this.sourceString));
  },

  number_whole(_arg0) {
    return new Value(new Fraction(this.sourceString));
  },

  ident(_arg0, _arg1) {
    const variables: Record<string, Value | undefined> = this.args.variables;

    const name = this.sourceString;

    const value = variables[name];

    if (value) {
      return value;
    } else {
      return Value.invalid(`Variable ${name} is not defined`);
    }
  },

  AddExp_plus(arg0, _arg1, arg2) {
    const variables = this.args.variables;
    return arg0.value(variables).add(arg2.value(variables));
  },

  AddExp_minus(arg0, _arg1, arg2) {
    const variables = this.args.variables;
    return arg0.value(variables).subtract(arg2.value(variables));
  },

  MulExp_times(arg0, _arg1, arg2) {
    const variables = this.args.variables;
    return arg0.value(variables).mul(arg2.value(variables));
  },

  SMulExp_shortTimes(arg0, arg1) {
    const variables = this.args.variables;
    return arg0.value(variables).mul(arg1.value(variables));
  },

  MulExp_divide(arg0, _arg1, arg2) {
    const variables = this.args.variables;
    return arg0.value(variables).div(arg2.value(variables));
  },

  ExpExp_power(arg0, _arg1, arg2) {
    const variables = this.args.variables;
    return arg0.value(variables).exp(arg2.value(variables));
  },

  ExpExp_powerRSign(arg0, _arg1, arg2) {
    const variables = this.args.variables;
    return arg0.value(variables).exp(arg2.value(variables));
  },

  PriExp_paren(_arg0, arg1, _arg2) {
    const variables = this.args.variables;
    return arg1.value(variables);
  },

  SignExp_pos(_arg0, arg1) {
    return arg1.value(this.args.variables);
  },

  SignExp_neg(_arg0, arg1) {
    return arg1.value(this.args.variables).neg();
  },
});

calcSemantics.addAttribute<string[]>('variables', {
  ident(_arg0, _arg1) {
    return [this.sourceString];
  },

  number_fract(_arg0, _arg1, _arg2) {
    return [];
  },

  number_whole(_arg0) {
    return [];
  },

  _terminal() {
    return [];
  },

  _nonterminal(...children) {
    return children.map((x) => x.variables).flat();
  },
});

type Result = { ok: true; value: Value } | { ok: false; error: string };

export function parseValue(s: string): Result {
  const m = arithmeticGrammar.match(s);
  if (m.failed()) return { ok: false, error: `Cannot parse "${s}"` };
  const r = calcSemantics(m);
  const value: Value = r.value({ a: Value.fromNumber(20) });

  if (value.invalidReason) {
    return { ok: false, error: `Invalid expression ${s}: ${value.invalidReason}` };
  }

  return { ok: true, value };
}
