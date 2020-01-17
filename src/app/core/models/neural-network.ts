import { Observable } from 'rxjs';
import { NeuralNetworkMatrices, NeuralNetworkConfig, NeuralNetworkTrainingConfig, PropagationStepResult } from './artifacts';

export interface NeuralNetwork {
  matrices: NeuralNetworkMatrices;
  weightMatrices: any[];
  errorMatrices: any[];
  outputMatrices: any[];
  hasSample: boolean;
  sampleError: number;
  sampleDerivativeSum: number;
  currentNetworkConfig: NeuralNetworkConfig;
  currentTrainingConfig: NeuralNetworkTrainingConfig;

  init(networkConfig: NeuralNetworkConfig);
  initTraining(trainingConfig: NeuralNetworkTrainingConfig);
  distributeWeights();
  setProcessingSample(inputList: number[], targetList: number[]);
  setOutputProcessingSample(inputList: number[]);
  train(inputList: number[], targetList: number[]);
  calcOutput(inputList: number[]);
  propagateSampleStep(): Observable<PropagationStepResult>;
  reset();
}
