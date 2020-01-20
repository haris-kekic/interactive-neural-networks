
import { NeuralNetwork } from './neural-network';
import { Observable } from 'rxjs';
import { math } from '../utils/math-extension';
import { NeuralNetworkConfig,
        NeuralNetworkDatasetConfig,
        NeuralNetworkMatrices,
        NeuralNetworkLayer,
        PropagationDirection,
        PropagationStepResult,
        DatasetConfigDefaults,
        WeightDistributionList,
        ActivationFunctionList
} from './artifacts';

export const defaultNetworkConfig: NeuralNetworkConfig = {
  weightDistribution: WeightDistributionList[0],
  layers: [{ neuronCount: 4, activation: ActivationFunctionList[0] },
  { neuronCount: 3, activation: ActivationFunctionList[2] },
  { neuronCount: 2, activation: ActivationFunctionList[1] }],
  inputLabels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
  outputLabels: ['Label 1', 'Label 2'],
  errorFormula: '{1 \\over M} \\sum_{s=1}^M \\sum_{i=1}^N (\\overline{o}_i^s - o_i^s)^2'
};

export class FeedForwardNeuralNetwork implements NeuralNetwork {
  private mMatrices: NeuralNetworkMatrices;
  private mPreviousWeightMatrices: any[] = [];
  private mInputMatrix: any;
  private mTargetMatrix: any;
  private mLayerIndex = 0;
  private mLayerCount = 0;
  private mLayers: NeuralNetworkLayer[];

  private mNetworkConfig: NeuralNetworkConfig;
  private mTrainingConfig: NeuralNetworkDatasetConfig;
  private mSampleError = 0;
  private mSampleDerivativeSum = 0; // used for global error calculation

  // maps all matrices from math matrix object to an two dimensional array
  public get matrices() {
    const matricesAsArrays: NeuralNetworkMatrices = {} as NeuralNetworkMatrices;
    matricesAsArrays.weightMatrices = this.weightMatrices;
    matricesAsArrays.outputMatrices = this.outputMatrices;
    matricesAsArrays.errorMatrices = this.errorMatrices;
    return matricesAsArrays;
  }

  public get weightMatrices() {
    // maps mathjs matrix object to array in order to be able to iterate in view
    // make also a deep copy, so the consumer won
    return [...this.mMatrices.weightMatrices.map((matrix) => [...matrix.clone().toArray()])];
  }

  public get outputMatrices() {
    // maps mathjs matrix object to array in order to be able to iterate in view
    // make also a deep copy, so the consumer won
    return [...this.mMatrices.outputMatrices.map((matrix) => [...matrix.clone().toArray()])];
  }

  public get errorMatrices() {
    // maps mathjs matrix object to array in order to be able to iterate in view
    // make also a deep copy, so the consumer won
    return [...this.mMatrices.errorMatrices.map((matrix) => [...matrix.clone().toArray() ])];
  }

  public get sampleError(): number {
    return this.mSampleError;
  }

  public get sampleDerivativeSum(): number {
    return this.mSampleDerivativeSum;
  }

  public get hasSample(): boolean {
    return this.mInputMatrix != null;
  }

  public get currentNetworkConfig() {
    return {...this.mNetworkConfig };
  }

  public get currentTrainingConfig() {
    return {...this.mTrainingConfig };
  }

  constructor() {
    this.init(defaultNetworkConfig);
    this.initTraining(DatasetConfigDefaults);
  }

  public init(networkConfig?: NeuralNetworkConfig) {
    this.mNetworkConfig = {...defaultNetworkConfig, ...networkConfig };

    if (this.mNetworkConfig.layers == null || this.mNetworkConfig.layers.length < 2) {
      throw Error('Neural network should at least have two layers');
    }

    // pull out the layer config from network config for easier use later
    this.mLayers = this.mNetworkConfig.layers;
    this.mLayerCount = this.mLayers.length;

    // init the list of matrices
    this.mMatrices = {
      weightMatrices: [],
      errorMatrices: [],
      outputMatrices: [],
      derivativeMatrices: []
    } as NeuralNetworkMatrices;

    // init the weight matrices based on layer neuron counts
    this.distributeWeights();
    // this.mMatrices.weightMatrices[0] = math.matrix(
    //           [
    //             [0.3, 0.2, 0.1, 0.5],
    //             [-0.1, 0.4, -0.2, 0.2],
    //             [0.1, 0.3, -0.5, 0.1]
    //         ]);
    // this.mMatrices.weightMatrices[1] = math.matrix(
    //           [
    //             [0.4, 0.1, -0.3],
    //             [0.3, 0.2, -0.4]
    //           ]);
  }

  public initTraining(trainingConfig: NeuralNetworkDatasetConfig) {
    this.mTrainingConfig = {...DatasetConfigDefaults, ...trainingConfig };
  }

  public distributeWeights() {
      // distribute random weights for all connections between layers
      this.mNetworkConfig.layers.forEach((layer, index, layers) => {
        if (index > 0 && index < this.mLayerCount) {
          this.mMatrices.weightMatrices[index - 1] =
              this.mNetworkConfig.weightDistribution.func(layer.neuronCount, layers[index - 1].neuronCount, -0.5, 0.5);
        }
      });
  }

  public setProcessingSample(inputList: number[], targetList: number[]): void {
    if (this.mMatrices.weightMatrices.length === 0) {
      throw Error('No weights defined!');
    }

    if (inputList == null || inputList.length !== this.mNetworkConfig.layers[0].neuronCount) {
      throw Error('No input proveded or the number of inputs does not match the number of neurons in input layer!');
    }

    this.reset();

    // make a colum vector from flat array
    this.mInputMatrix = math.matrix(math.reshape(inputList, [inputList.length, 1]));

    // make a colum vector from flat array if provided
    this.mTargetMatrix = targetList !== null ? math.matrix(math.reshape(targetList, [targetList.length, 1])) : null;

    // make copy of the initial weight matrices
    this.mPreviousWeightMatrices = [...this.mMatrices.weightMatrices.map(wm => wm.clone() ) ];
  }

  public setOutputProcessingSample(inputList: number[]): void {

    if (this.mMatrices.weightMatrices.length === 0) {
      throw Error('No weights defined!');
    }

    if (inputList == null || inputList.length !== this.mNetworkConfig.layers[0].neuronCount) {
      throw Error('No input proveded or the number of inputs does not match the number of neurons in input layer!');
    }

    this.reset();

    this.mInputMatrix = math.matrix(math.reshape(inputList, [inputList.length, 1]));

    // make copy of the initial weight matrices
    this.mPreviousWeightMatrices = Object.assign([], this.mMatrices.weightMatrices);
  }

  public reset() {
    // reset all matrices except weight matrices as we need them during the whole process
    this.mInputMatrix = null;
    this.mTargetMatrix = null;

    this.mMatrices.errorMatrices.splice(0, this.mMatrices.errorMatrices.length); // safely clear arrays
    this.mMatrices.outputMatrices.splice(0, this.mMatrices.outputMatrices.length); // safely clear arrays
    this.mMatrices.derivativeMatrices.splice(0, this.mMatrices.derivativeMatrices.length); // safely clear arrays

    this.mLayerIndex = 0;
    this.mSampleError = 0;
    this.mSampleDerivativeSum = 0;
  }

  public train(inputList: number[], targetList: number[]) {
    this.setProcessingSample(inputList, targetList);

    while (this.mLayerIndex < this.mLayerCount) {
      this.propagateForward();
      this.mLayerIndex++;
    }
    this.mLayerIndex = this.mLayerCount - 1;
    while (this.mLayerIndex > 0) {
      this.propagateBackward();
      this.mLayerIndex--;
    }

    this.calcErrors();
  }

  public output(inputList: number[], targetList: number[]) {
    this.setProcessingSample(inputList, targetList);

    while (this.mLayerIndex < this.mLayerCount) {
      this.propagateForward();
      this.mLayerIndex++;
    }
    const curOutputMatrix = this.mMatrices.outputMatrices[this.mLayerIndex - 1];
    const errorMatrix = math.subtract(this.mTargetMatrix, curOutputMatrix);
    this.mMatrices.errorMatrices[this.mMatrices.errorMatrices.length] = errorMatrix;
    this.calcErrors();
  }

  public propagateSampleStep(): Observable<PropagationStepResult> {
    return new Observable<PropagationStepResult>((observer) => {
      if (this.mMatrices.weightMatrices.length === 0) {
        throw Error('No weights defined!');
      }

      if (this.mInputMatrix == null) {
        throw Error('Neural network must be initialized either for trainig or output calculation');
      }

      const processingResult: PropagationStepResult = {};
          // Forward propagation
      if (this.canPropagateForward) {
        processingResult.direction = PropagationDirection.FORWARDPROPAGATION;
        processingResult.layer = this.mLayerIndex;
        this.propagateForward();
        this.mLayerIndex++;
        observer.next(processingResult);
        observer.complete();
        return;
      }



      this.normalizeLayerIndex();
          // Backpropagation
      if (this.canPropagateBackward) {
        this.propagateBackward();
        processingResult.direction = PropagationDirection.BACKPROPAGATION;
        processingResult.layer = this.mLayerIndex;
        this.mLayerIndex--;
        observer.next(processingResult);
        observer.complete();
        return;
      }

      this.calcErrors();

      processingResult.direction = PropagationDirection.FINISHED;
      observer.next(processingResult);
      observer.complete();
      return;
    });
  }

  private calcErrors() {
    this.mSampleError = math.sum(math.square(this.mMatrices.errorMatrices[this.errorMatrices.length - 1]));
    // Skip the derivates of the first input layer
    this.mMatrices.derivativeMatrices.slice(1).forEach((matrix) => {
      const squareMatrix = math.square(matrix);
      const sumSquareMatrix = math.sum(squareMatrix);
      this.mSampleDerivativeSum += sumSquareMatrix;
    });
  }

  private get canPropagateForward(): boolean {
    return this.mLayerIndex < this.mLayerCount
          && this.mMatrices.outputMatrices.length < this.mLayerCount
          && this.mInputMatrix != null;
  }

  private get canPropagateBackward(): boolean {
    // 0 Layer is input layer, so it will be skipped
    return this.mLayerIndex > 0
          && this.mMatrices.outputMatrices.length === this.mLayerCount
          && this.mTargetMatrix != null;
  }

  private normalizeLayerIndex() {
    if (this.mLayerIndex >= this.mLayerCount) {
      this.mLayerIndex = this.mLayerCount - 1;
   }
  }

  public propagateBackward() {
    // check if back propagation possible (e.g. if reached the input layer)
    if (!this.canPropagateBackward) {
      return;
    }

    // get the output layer index to make
    const lastLayerIndex = this.mLayerCount - 1;

    // take the output matrix of the current layer
    const curOutputMatrix = this.mMatrices.outputMatrices[this.mLayerIndex];

    // take the calculated derivative for current layer for needed for calculation later on
    const curDerivativeMatrix = this.mMatrices.derivativeMatrices[this.mLayerIndex];

    // take the previous output matrix based on current index
    const prevOutputMatrix = this.mMatrices.outputMatrices[this.mLayerIndex - 1];

    // first we try to calculate the error matrix for the current layer
    let errorMatrix: any;

    // check if we are at the last output layer
    if (this.mLayerIndex === lastLayerIndex) {
      // the error matrix for the output layer (last layer) of the NN is calculated: Target - Output
      errorMatrix = math.subtract(this.mTargetMatrix, curOutputMatrix);
    } else {
        // the errors calculated in the layer after will be back propagated and 'distributed'
        // across the weights between two layers. Concretely we multiply the weights
        // between two layers with the errors we got from the nodes of the next layer
        // vectorization of this process: Ej = Trans(wjk) x Ok
      errorMatrix = math.multiply(math.transpose(this.mPreviousWeightMatrices[this.mLayerIndex]),
                                  this.mMatrices.errorMatrices[this.mLayerIndex + 1]);
    }
    // store the calculated error matrix in the list beginning from back
    this.mMatrices.errorMatrices[this.mLayerIndex] = errorMatrix;

    // the formula for delta = E * derivative of output * previous layer output
    // first calculate E * derivative elementwise
    const productErrorDerivativeMatrix = math.dotMultiply(errorMatrix, curDerivativeMatrix);

    // second calculate the product above with the output of previous layer
    const deltaWeightMatrix = math.multiply(productErrorDerivativeMatrix, math.transpose(prevOutputMatrix));

    // apply learn rate to delta
    const weightChangeMatrixLearnRate = math.dotMultiply(this.mTrainingConfig.learnRate, deltaWeightMatrix);

    // update the weights in weight matrix with the calculated change (learnRate * delta)
    this.mMatrices.weightMatrices[this.mLayerIndex - 1] =
              math.add(this.mMatrices.weightMatrices[this.mLayerIndex - 1], weightChangeMatrixLearnRate);
  }

  public propagateForward(): boolean {
    // check if we can propagate
    if (!this.canPropagateForward) {
      return;
    }

    // fetch the weight matrix for current layer from weight matrix list. However, if first layer (layer = 0), then there is
    // no weight matrix. Instead we create an identity matrix as weight matrix, to able to perform matrix multiplication later on.
    // Matrix multiplication with identity matrix returns the same matrix we multiplied with it: in this case the input matrix
    const weightMatrix = this.mLayerIndex > 0
                          ? this.mMatrices.weightMatrices[this.mLayerIndex - 1]
                          : math.identity(this.mInputMatrix.size()[0], this.mInputMatrix.size()[0]);

    // calculate the weighted sum product for all nodes in the current
    const inputWeightSumProductMatrix = math.multiply(weightMatrix, this.mInputMatrix);

    // get the current layer configuration
    const thisLayer = this.mLayers[this.mLayerIndex];

    // apply activation function on each neuron to the weighted weighted sum and generate an output matrix for current layer
    const outputMatrix = math.applyTo(inputWeightSumProductMatrix, thisLayer.activation.func);

    // apply derivative of the activation function. We will use in back propagation.
    const outputDerivativeMatrix = math.applyTo(inputWeightSumProductMatrix, thisLayer.activation.derivativeFunc);

    // add the current layer output matrix to the list of neural network list matrices
    this.mMatrices.outputMatrices.push(outputMatrix.clone());

    // add derivative of the activation function for current layer to the list
    this.mMatrices.derivativeMatrices.push(outputDerivativeMatrix.clone());

    // set the current output matrix as an input matrix for next propagation step
    this.mInputMatrix = outputMatrix;
  }
}
