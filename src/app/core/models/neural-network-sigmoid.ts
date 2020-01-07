
// import { NeuralNetwork } from './neural-network';
// import { Observable } from 'rxjs';
// import { math } from '../utils/math-extension';
// import { WeightDistributionList, NeuralNetworkConfig, NeuralNetworkTrainingConfig, NeuralNetworkMatrices, ActivationFunctionList, PropagationDirection, PropagationStepResult } from './artifacts';

// const networkConfigDefaults: NeuralNetworkConfig = {
//   layerNeurons: [4, 3, 3, 2],
//   weightDistribution: WeightDistributionList[0],
//   layers: [{ neuronCount: 4, activation: ActivationFunctionList[0] },
//            { neuronCount: 3, activation: ActivationFunctionList[3] },
//            { neuronCount: 2, activation: ActivationFunctionList[1] }]
// };

// const traingingConfigDefaults: NeuralNetworkTrainingConfig = {
//   learnRate: 1.5
// };

// export class NeuralNetworkSigmoid implements NeuralNetwork {
//   private neuralNetworMatrices: NeuralNetworkMatrices;
//   private previousWeightMatrices: any[] = [];

//   private inputMatrix: any;
//   private targetMatrix: any;
//   private layerIndex = 0;
//   private layerCount = 0;

//   private activate: (x: number) => number = math.sigmoid;

//   private networkConfig: NeuralNetworkConfig;
//   private trainingConfig: NeuralNetworkTrainingConfig;

//   // maps all matrices from math matrix object to an two dimensional array
//   public get matrices() {
//     const matricesAsArrays: NeuralNetworkMatrices = {} as NeuralNetworkMatrices;
//     matricesAsArrays.weightMatrices = this.weightMatrices; // make copy
//     matricesAsArrays.outputMatrices = this.outputMatrices;
//     matricesAsArrays.errorMatrices = this.errorMatrices;
//     return matricesAsArrays;
//   }

//   public get weightMatrices() {
//     // maps mathjs matrix object to array in order to be able to iterate in view
//     // make also a deep copy, so the consumer won
//     return Object.assign([], this.neuralNetworMatrices.weightMatrices.map((matrix) => Object.assign([], matrix.toArray())));
//   }

//   public get outputMatrices() {
//     // maps mathjs matrix object to array in order to be able to iterate in view
//     // make also a deep copy, so the consumer won
//     return Object.assign([], this.neuralNetworMatrices.outputMatrices.map((matrix) => Object.assign([], matrix.toArray())));
//   }

//   public get errorMatrices() {
//     // maps mathjs matrix object to array in order to be able to iterate in view
//     // make also a deep copy, so the consumer won
//     return Object.assign([], this.neuralNetworMatrices.errorMatrices.map((matrix) => Object.assign([], matrix.toArray())));
//   }

//   public get hasSample(): boolean {
//     return this.inputMatrix != null;
//   }

//   public get currentNetworkConfig() {
//     return {...this.networkConfig };
//   }

//   constructor() {
//     this.init(networkConfigDefaults);
//     this.initTraining(traingingConfigDefaults);
//   }

//   public init(networkConfig?: NeuralNetworkConfig) {
//     this.networkConfig = {...networkConfigDefaults, ...networkConfig };

//     if (this.networkConfig.layerNeurons == null || this.networkConfig.layerNeurons.length < 2) {
//       throw Error('Neural network should at least have two layers');
//     }

//     this.layerCount = this.networkConfig.layerNeurons.length;

//     this.neuralNetworMatrices = { weightMatrices: [], outputMatrices: [], errorMatrices: []} as NeuralNetworkMatrices;
//     this.distributeWeights();
//   }

//   public initTraining(trainingConfig: NeuralNetworkTrainingConfig) {
//     this.trainingConfig = {...traingingConfigDefaults, ...trainingConfig };
//   }

//   public distributeWeights() {
//       // distribute random weights for all connections between layers
//       this.networkConfig.layerNeurons.forEach((neuronCount, index, thisLayerNeuronCount) => {
//         if (index > 0 && index < this.layerCount) {
//           this.neuralNetworMatrices.weightMatrices[index - 1] =
//                                   this.networkConfig.weightDistribution.func(neuronCount, thisLayerNeuronCount[index - 1], -0.5, 0.5);
//         }
//       });
//   }

//   public setProcessingSample(inputList: number[], targetList: number[]): void {
//     if (this.neuralNetworMatrices.weightMatrices.length === 0) {
//       throw Error('No weights defined!');
//     }

//     if (inputList == null || inputList.length !== this.networkConfig.layerNeurons[0]) {
//       throw Error('No input proveded or the number of inputs does not match the number of neurons in input layer!');
//     }

//     this.reset();

//     this.inputMatrix = math.matrix(math.reshape(inputList, [inputList.length, 1]));
//     this.targetMatrix = targetList !== null ? math.matrix(math.reshape(targetList, [targetList.length, 1])) : null;

//     // make copy of the initial weight matrices
//     this.previousWeightMatrices = Object.assign([], this.neuralNetworMatrices.weightMatrices);
//   }

//   public setOutputProcessingSample(inputList: number[]): void {

//     if (this.neuralNetworMatrices.weightMatrices.length === 0) {
//       throw Error('No weights defined!');
//     }

//     if (inputList == null || inputList.length !== this.networkConfig.layerNeurons[0]) {
//       throw Error('No input proveded or the number of inputs does not match the number of neurons in input layer!');
//     }

//     this.reset();

//     this.inputMatrix = math.matrix(math.reshape(inputList, [inputList.length, 1]));

//     // make copy of the initial weight matrices
//     this.previousWeightMatrices = Object.assign([], this.neuralNetworMatrices.weightMatrices);
//   }

//   public reset() {
//     this.inputMatrix = null;
//     this.targetMatrix = null;

//     this.neuralNetworMatrices.errorMatrices.splice(0, this.neuralNetworMatrices.errorMatrices.length); // safely clear arrays
//     this.neuralNetworMatrices.outputMatrices.splice(0, this.neuralNetworMatrices.outputMatrices.length); // safely clear arrays

//     this.layerIndex = 0;
//   }

//   public train(inputList: number[], targetList: number[]) {
//     this.setProcessingSample(inputList, targetList);

//     while (this.layerIndex < this.layerCount) {
//       this.propagateForward();
//       this.layerIndex++;
//     }
//     this.layerIndex = this.layerCount - 1;
//     while (this.layerIndex > 0) {
//       this.propagateBackward();
//       this.layerIndex--;
//     }
//   }

//   public calcOutput(inputList: number[]) {
//     this.setOutputProcessingSample(inputList);

//     while (this.layerIndex < this.layerCount) {
//       this.propagateForward();
//       this.layerIndex++;
//     }
//   }

//   public propagateSampleStep(): Observable<PropagationStepResult> {
//     return new Observable<PropagationStepResult>((observer) => {
//       if (this.neuralNetworMatrices.weightMatrices.length === 0) {
//         throw Error('No weights defined!');
//       }

//       if (this.inputMatrix == null) {
//         throw Error('Neural network must be initialized either for trainig or output calculation');
//       }

//       const processingResult: PropagationStepResult = {};
//           // Forward propagation
//       if (this.canPropagateForward) {
//         processingResult.direction = PropagationDirection.FORWARDPROPAGATION;
//         processingResult.layer = this.layerIndex;
//         this.propagateForward();
//         this.layerIndex++;
//         observer.next(processingResult);
//         observer.complete();
//         return;
//       }

//       this.normalizeLayerIndex();
//           // Backpropagation
//       if (this.canPropagateBackward) {
//         this.propagateBackward();
//         processingResult.direction = PropagationDirection.BACKPROPAGATION;
//         processingResult.layer = this.layerIndex;
//         this.layerIndex--;
//         observer.next(processingResult);
//         observer.complete();
//         return;
//       }

//       processingResult.direction = PropagationDirection.FINISHED;
//       observer.next(processingResult);
//       observer.complete();
//       return;
//     });
//   }

//   // private editWeightMatrix(matrixIndex: number, weightTable: number[][]) {
//   //   if (matrixIndex < 0 || matrixIndex >= this.neuralNetworMatrices.weightMatrices.length) {
//   //     throw Error(`Weight matrix with index ${matrixIndex} does not exist`);
//   //   }

//   //   const rowCount = this.neuralNetworMatrices.weightMatrices[matrixIndex].size()[0];
//   //   const colCount = this.neuralNetworMatrices.weightMatrices[matrixIndex].size()[1];

//   //   if (weightTable.length !== colCount || weightTable[0].length !== rowCount) {
//   //     throw Error('The dimensions of the provided matrix and the existing matrix do not match');
//   //   }
//   // }

//   // private editWeight(matrixIndex: number, row: number, column: number, weight: number) {
//   //   if (matrixIndex < 0 || matrixIndex >= this.neuralNetworMatrices.weightMatrices.length) {
//   //     throw Error(`Weight matrix with index ${matrixIndex} does not exist`);
//   //   }

//   //   const rowCount = this.neuralNetworMatrices.weightMatrices[matrixIndex].size()[0];
//   //   const colCount = this.neuralNetworMatrices.weightMatrices[matrixIndex].size()[1];

//   //   if (row < 0 || row >= rowCount || column < 0 || column >= colCount ) {
//   //     throw Error('The dimensions of the provided matrix and the existing matrix do not match');
//   //   }

//   //   this.neuralNetworMatrices.weightMatrices[matrixIndex].subset(math.index(row, column), weight);
//   // }


//   private get canPropagateForward(): boolean {
//     return this.layerIndex < this.layerCount
//           && this.neuralNetworMatrices.outputMatrices.length < this.layerCount
//           && this.inputMatrix != null;
//   }

//   private get canPropagateBackward(): boolean {
//     // 0 Layer is input layer, so it will be skipped
//     return this.layerIndex > 0
//           && this.neuralNetworMatrices.outputMatrices.length === this.layerCount
//           && this.targetMatrix != null;
//   }

//   private normalizeLayerIndex() {
//     if (this.layerIndex >= this.layerCount) {
//       this.layerIndex = this.layerCount - 1;
//    }
//   }

//   private propagateBackward() {

//     if (!this.canPropagateBackward) {
//       return;
//     }

//     const outputMatrix = this.neuralNetworMatrices.outputMatrices[this.layerIndex];

//     // take the previous output matrix based on current index
//     const prevOutputMatrix = this.neuralNetworMatrices.outputMatrices[this.layerIndex - 1];

//     // first we try to calculate the error matrix Ek
//     // store error matricx for current output
//     let errorMatrix: any;

//     // check if we are at the beginning of the list, that means the output layer of NN
//     if (this.layerIndex === (this.neuralNetworMatrices.outputMatrices.length - 1)) {
//       // the error matrix for the output layer of the NN is calculated: Target - Output
//       errorMatrix = math.subtract(this.targetMatrix, outputMatrix);
//     } else {
//         // the error matrix for the output layer of the NN is calculated: Ej = Trans(wjk) x Ok
//         // j is the previous and k the current layer
//         // * elementwise matrix multiplication - dot multiplication
//         // x full matrix multiplication
//       const transposedWeightMatrix = math.transpose(this.previousWeightMatrices[this.layerIndex]);
//       errorMatrix = math.multiply(transposedWeightMatrix, this.neuralNetworMatrices.errorMatrices[this.layerIndex + 1]);
//     }
//     // store the calculated error matrix in the list beginning from back
//     this.neuralNetworMatrices.errorMatrices[this.layerIndex] = errorMatrix;

//       // subtract the current output matrix from the ones column
//       // formula part: (1 - Ok)
//     const subtractedOutputMatrix = math.subtract(1, outputMatrix);

//       // calculate the part of the formula above: OP = Ok * (1 - Ok)
//     const outputProductMatrix = math.dotMultiply(outputMatrix, subtractedOutputMatrix);

//       // take the output of the previous layer and transpose it
//     const transposedPrevOutputMatrix = math.transpose(prevOutputMatrix);

//       // calculate the part of the formula above: Ek * OP
//     const errorOutputMatrixProduct = math.dotMultiply(errorMatrix, outputProductMatrix);

//       // calculate the weight change: see full formula above the iteration
//     const weightChangeMatrix = math.multiply(errorOutputMatrixProduct, transposedPrevOutputMatrix);

//       // calculate the weight change: see full formula above the iteration
//     const weightChangeMatrixLearnRate = math.dotMultiply(this.trainingConfig.learnRate, weightChangeMatrix);

//       // UPDATE the weight matrix with the calculated change
//     this.neuralNetworMatrices.weightMatrices[this.layerIndex - 1] =
//               math.add(this.neuralNetworMatrices.weightMatrices[this.layerIndex - 1], weightChangeMatrixLearnRate);
//   }

//   private propagateForward(): boolean {

//     if (!this.canPropagateForward) {
//       return;
//     }

//     if (this.layerIndex === 0) {
//       this.neuralNetworMatrices.outputMatrices.push(this.inputMatrix);
//       return;
//     }

//     const weightMatrix = this.neuralNetworMatrices.weightMatrices[this.layerIndex - 1];
//     const inputWeightProductMatrix = math.multiply(weightMatrix, this.inputMatrix);
//     const outputMatrix: any = math.matrix(inputWeightProductMatrix.map((inputWeightProduct: number) => {
//          return this.activate(inputWeightProduct);
//     }));

//     this.inputMatrix = outputMatrix;
//     this.neuralNetworMatrices.outputMatrices.push(outputMatrix);
//   }
// }
