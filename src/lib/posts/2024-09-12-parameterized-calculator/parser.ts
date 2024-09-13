import Fraction from 'fraction.js';
import type { IterationNode, Node, NonterminalNode } from 'ohm-js';

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

calcSemantics.addAttribute<string[]>('variablesDuplicate', {
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
    return children.map((x) => x.variablesDuplicate).flat();
  },
});

type InternalSegments = (string | { isVariable: true; variable: string })[];

function displaySegmentsInternalMultiChild(
  node: NonterminalNode | IterationNode,
  children: Node[],
  outermost = false
) {
  let lastIdx = outermost ? 0 : node.source.startIdx;

  const result: InternalSegments = [];

  for (const child of children) {
    const childStart = child.source.startIdx;
    if (lastIdx !== childStart) {
      result.push(node.source.sourceString.slice(lastIdx, childStart));
    }
    result.push(...child.displaySegmentsInternal(false));
    lastIdx = child.source.endIdx;
  }

  if (lastIdx < node.source.sourceString.length) {
    result.push(
      node.source.sourceString.slice(lastIdx, outermost ? undefined : node.source.endIdx)
    );
  }

  return result;
}
calcSemantics.addOperation<InternalSegments>('displaySegmentsInternal(start)', {
  _terminal() {
    return [this.sourceString];
  },
  ident(_arg0, _arg1) {
    return [{ isVariable: true, variable: this.sourceString }];
  },
  _nonterminal(...children) {
    return displaySegmentsInternalMultiChild(this, children, this.args.start);
  },
  _iter(...children) {
    return displaySegmentsInternalMultiChild(this, children, this.args.start);
  },
});

export type DisplaySegments = { type: 'string' | 'variable'; value: string }[];

export function getDisplaySegments(sem: any) {
  const internalSegments: InternalSegments = sem.displaySegmentsInternal(true);

  const result: DisplaySegments = [];

  let pendingStringSegments: string[] = [];

  for (const segment of internalSegments) {
    if (typeof segment === 'string') {
      pendingStringSegments.push(segment);
    } else {
      result.push({ type: 'string', value: pendingStringSegments.join('') });
      pendingStringSegments = [];
      result.push({ type: 'variable', value: segment.variable });
    }
  }

  if (pendingStringSegments.length > 0) {
    result.push({ type: 'string', value: pendingStringSegments.join('') });
  }

  return result;
}

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
