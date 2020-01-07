import { math } from '../utils/math-extension';

export const NeuralNetworkPlayground = {
  BUILTIN: 'builtin',
  CUSTOM: 'custom'
};

export enum NeuralNetworkPhase {
  TRAINING,
  EXECUTION
}

export enum NeuralNetworkView {
  GRAPH,
  MATRIX,
}

export enum PropagationDirection {
  FORWARDPROPAGATION,
  BACKPROPAGATION,
  FINISHED
}

export interface PropagationStepResult {
  direction?: PropagationDirection;
  layer?: number;
}

export interface MathFunction<SIGNATURE> {
  id: number;
  name: string;
  func: SIGNATURE;
  funcFormula?: string;
  derivativeFunc?: SIGNATURE;
}

export interface WeightDistribution
          extends MathFunction<(rows: number, cols: number, min: number, max: number) => any> {}

export interface Activation
          extends MathFunction<(x: number) => number> {}

export interface NeuralNetworkLayer {
      neuronCount: number;
      activation: Activation;
}

export interface NeuralNetworkConfig {
  weightDistribution: WeightDistribution;
  layers: NeuralNetworkLayer[];
  inputLabels: string[];
  outputLabels: string[];
}

export interface NeuralNetworkTrainingConfig {
  learnRate: number;
}

export interface NeuralNetworkMatrices {
  weightMatrices: any[];
  outputMatrices: any[];
  errorMatrices: any[];
  derivativeMatrices: any[];
}

export const WeightDistributionList: WeightDistribution[] = [
  { id: 1, name: 'Unfirom Random', func: math.uniform},
  { id: 2, name: 'Normal Random', func: math.normal},
];

export const ActivationFunctionList: Activation[] = [
  { id: 1, name: 'Identity', func: math.ident, derivativeFunc: math.dIdent, funcFormula: 'f(x) = x'},
  { id: 2, name: 'Sigmoid', func: math.sigmoid, derivativeFunc: math.dSigmoid, funcFormula: 'f(x) = {1 \\over 1 + e^{-x} }' },
  { id: 3, name: 'Hyperbolic Tang.', func: math.tanh, derivativeFunc: math.dTanh, funcFormula: 'f(x) = {e^{x} - e^{-x} \\over e^{x} + e^{-x} }'},
  { id: 4, name: 'ReLU', func: math.relu, derivativeFunc: math.dRelu, funcFormula: 'f(x) = \\begin{cases} 0 & \\text{for } x < 0 \\\\ x & \\text{for } x  \\ge 0 \\ \\end{cases}'},
  { id: 5, name: 'Leaky ReLU', func: math.leaky_relu, derivativeFunc: math.dLeaky_relu, funcFormula: 'f(x) = \\begin{cases} \\alpha x & \\text{for } x < 0 \\\\ x & \\text{for } x \\ge 0 \\ \\end{cases}' }
];

export const TrainingConfigDefaults: NeuralNetworkTrainingConfig = {
  learnRate: 0.1
};
