import { Observable } from 'rxjs';
import { NeuralNetworkMatrices, NeuralNetworkConfig, NeuralNetworkDatasetConfig, PropagationStepResult } from './artifacts';

export interface NeuralNetwork {
  matrices: NeuralNetworkMatrices;
  weightMatrices: any[];
  errorMatrices: any[];
  outputMatrices: any[];
  hasSample: boolean;
  sampleError: number;
  sampleDerivativeSum: number;
  currentNetworkConfig: NeuralNetworkConfig;
  currentTrainingConfig: NeuralNetworkDatasetConfig;

  init(networkConfig: NeuralNetworkConfig);
  initTraining(trainingConfig: NeuralNetworkDatasetConfig);
  distributeWeights();
  setProcessingSample(inputList: number[], targetList: number[]);
  setOutputProcessingSample(inputList: number[]);
  train(inputList: number[], targetList: number[]);
  output(inputList: number[], targetList: number[]);
  propagateSampleStep(): Observable<PropagationStepResult>;
  reset();
}
