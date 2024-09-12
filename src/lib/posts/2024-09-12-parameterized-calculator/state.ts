import { makeAutoObservable } from 'mobx';
import { arithmeticGrammar, calcSemantics } from './parser';
import type { Value } from './value';

type Variables = Record<string, Value>;

type CalculationParams = {
  onUpdate?: () => void;
};

export class Calculation {
  constructor(private params: CalculationParams) {
    makeAutoObservable(this);
  }

  inputText = '';

  variables: Variables = {};

  updateText(text: string) {
    this.inputText = text;

    this.params.onUpdate?.();
  }

  updateVariables(variables: Variables) {
    this.variables = variables;
  }

  get match() {
    return arithmeticGrammar.match(this.inputText);
  }

  get semantics() {
    if (this.match.failed()) {
      return null;
    }

    return calcSemantics(this.match);
  }

  get value(): Value | null {
    if (!this.semantics) {
      return null;
    }

    return this.semantics.value(this.variables);
  }

  get isValid() {
    return !!(this.value && !this.value.invalidReason);
  }
}

export class CalculatorState {
  mainCalculation: Calculation;

  constructor() {
    this.mainCalculation = new Calculation({
      onUpdate: () => {
        if (this.mainCalculation.semantics) {
          this.lastValidVariables = this.mainCalculation.semantics.variables;

          for (const variableName of this.lastValidVariables) {
            if (!this.variables[variableName]) {
              this.variables[variableName] = new Calculation({
                onUpdate: () => {
                  console.log('onUpdate', this.validVariableValues);
                  const validVariableValues = this.validVariableValues;

                  this.mainCalculation.updateVariables(validVariableValues);
                },
              });
            }
          }
        }
      },
    });

    makeAutoObservable(this);
  }

  lastValidVariables = [] as string[];

  variables = {} as Record<string, Calculation | undefined>;

  get validVariables() {
    const result = {} as Record<string, Calculation>;
    for (const name of this.lastValidVariables) {
      if (this.variables[name]) {
        result[name] = this.variables[name];
      }
    }

    return result;
  }

  get validVariableValues(): Record<string, Value> {
    console.log('vvv computed');
    const result = {} as Record<string, Value>;
    for (const [name, calculation] of Object.entries(this.validVariables)) {
      console.log(name, calculation, !!(calculation.isValid && calculation.value));
      if (calculation.isValid && calculation.value) {
        result[name] = calculation.value;
      }
    }

    return result;
  }
}
