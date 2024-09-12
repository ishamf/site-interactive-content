import { makeAutoObservable } from 'mobx';
import {
  arithmeticGrammar,
  calcSemantics,
  getDisplaySegments,
  type DisplaySegments,
} from './parser';
import type { Value } from './value';

type Variables = Record<string, Value>;
type VariableColors = Record<string, string>;

type CalculationParams = {
  onUpdate?: () => void;
};

export class Calculation {
  constructor(private params: CalculationParams) {
    makeAutoObservable(this);
  }

  inputText = '';

  variables: Variables = {};

  variableColors: VariableColors = {};

  updateText(text: string) {
    this.inputText = text;

    this.params.onUpdate?.();
  }

  updateVariables(variables: Variables, variableColors: VariableColors) {
    this.variables = variables;
    this.variableColors = variableColors;
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

  get displaySegments(): DisplaySegments {
    if (!this.semantics) {
      return [{ type: 'string', value: this.inputText }];
    }

    return getDisplaySegments(this.semantics);
  }
}

export class CalculatorState {
  mainCalculation: Calculation;

  constructor() {
    this.mainCalculation = new Calculation({
      onUpdate: () => {
        if (this.mainCalculation.semantics) {
          this.lastValidVariables = Array.from(
            new Set(this.mainCalculation.semantics.variablesDuplicate)
          );
          this.mainCalculation.updateVariables(this.validVariableValues, this.variableColors);

          for (const variableName of this.lastValidVariables) {
            if (!this.variables[variableName]) {
              this.variables[variableName] = new Calculation({
                onUpdate: () => {
                  this.mainCalculation.updateVariables(
                    this.validVariableValues,
                    this.variableColors
                  );
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

  get variableColors() {
    const colors = {} as Record<string, string>;

    const colorStep = (1.8 * 180) / Math.PI;

    const variableNames = this.lastValidVariables;
    for (let i = 0; i < variableNames.length; i++) {
      colors[variableNames[i]] = `oklch(60% 0.1 ${(i * colorStep) % 360})`;
    }

    return colors;
  }

  get validVariableValues(): Record<string, Value> {
    const result = {} as Record<string, Value>;
    for (const [name, calculation] of Object.entries(this.validVariables)) {
      if (calculation.isValid && calculation.value) {
        result[name] = calculation.value;
      }
    }

    return result;
  }
}
