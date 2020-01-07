import * as math from 'mathjs';

export class NeuralNetwork2 {
  private mWeightMatrices: any[] = [];
  private mOutputMatrices: any[] = [];
  private mErrorMatrices: any[] = [];
  public get weightMatrices() {
    return this.mWeightMatrices.map((matrix) => matrix.toArray());
  }
  public get outputMatrices() {
    return this.mOutputMatrices.map((matrix) => matrix.toArray());
  }
  public get errorMatrices() {
    return this.mErrorMatrices.map((matrix) => matrix.toArray());
  }
  constructor(public layerNeurons: number[] = [2, 3], public learnRate: number = 0.5, public activationFunc: (x: number) => number = null) {
    if (layerNeurons == null || layerNeurons.length < 2) {
      throw Error('Neural network should at least have two layers');
    }
  }

  public distributeWeights() {
    // distribute random weights for all connections between layers
    this.layerNeurons.forEach((neurons, index, thisLayerNeurons) => {
      if (index > 0 && index < thisLayerNeurons.length) {
        this.mWeightMatrices[index - 1] = math.matrix(math.random([neurons, thisLayerNeurons[index - 1]], -0.5, 0.5));
      }
    });
}

  public train(inputList: number[], targetList: number[]) {

    if (inputList.length !== this.layerNeurons[0]) {
      throw Error('Number of inputs must match number of neurons of the input layer.');
    }

    if (targetList.length !== this.layerNeurons[this.layerNeurons.length - 1]) {
      throw Error('Number of outputs must match number of neurons of the output layer.');
    }

    // calculate the output
    this.calcOutput(inputList);
    // prepare the target values by converting the array (row) into a column for matrices calculation later on
    const targetMatrix = math.matrix(math.reshape(targetList, [targetList.length, 1]));
    // copy to preserve original weights, as the weights will be updated on each iteration
    const weightMatrices = Object.assign([], this.mWeightMatrices);
    // BACKPROPAGATION
    // iterate through the the output matrices, starting from the output layer (from last to first index)
    // and calulate the error matrix for each layer based on the output of the layer and update the weight matrices
    // between the layers.
    // Calculation formula for weight change: wjk = LearnRate * Ek * Ok * (1 - Ok) x Trans(Oj) where
    // j is the previous and k the current layer
    // * elementwise matrix multiplication - dot multiplication
    // x full matrix multiplication
    // we will split the calculation in parts for better debugging
    for (let index = this.mOutputMatrices.length - 1; index > 0; index--) {
      // 0 is the input layer, and we don't need to take any calculations on it, so it will be skipped by condition (index > 0)
      // now take the current output matrix based on index
      const outputMatrix = this.mOutputMatrices[index];
      // take the previous output matrix based on current index
      const prevOutputMatrix = this.mOutputMatrices[index - 1];
      // first we try to calculate the error matrix Ek
      // store error matricx for current output
      let errorMatrix: any;
      // check if we are at the beginning of the list, that means the output layer of NN
      if (index === (this.mOutputMatrices.length - 1)) {
        // the error matrix for the output layer of the NN is calculated: Target - Output
        errorMatrix = math.subtract(targetMatrix, outputMatrix);
      } else {
        // the error matrix for the output layer of the NN is calculated: Ej = Trans(wjk) x Ok
        // j is the previous and k the current layer
        // * elementwise matrix multiplication - dot multiplication
        // x full matrix multiplication
        const transposedWeightMatrix = math.transpose(weightMatrices[index]);
        errorMatrix = math.multiply(transposedWeightMatrix, this.mErrorMatrices[index + 1]);
      }
      // store the calculated error matrix in the list beginning from back
      this.mErrorMatrices[index] = errorMatrix;
      // subtract the current output matrix from the ones column
      // formula part: (1 - Ok)
      const subtractedOutputMatrix = math.subtract(1, outputMatrix);
      // calculate the part of the formula above: OP = Ok * (1 - Ok)
      const outputProductMatrix = math.dotMultiply(outputMatrix, subtractedOutputMatrix);
      // take the output of the previous layer and transpose it
      const transposedPrevOutputMatrix = math.transpose(prevOutputMatrix);
      // calculate the part of the formula above: Ek * OP
      const errorOutputMatrixProduct = math.dotMultiply(errorMatrix, outputProductMatrix);
      // calculate the weight change: see full formula above the iteration
      const weightChangeMatrix = math.multiply(errorOutputMatrixProduct, transposedPrevOutputMatrix);
      // calculate the weight change: see full formula above the iteration
      const weightChangeMatrixLearnRate = math.dotMultiply(this.learnRate, weightChangeMatrix);
      // UPDATE the weight matrix with the calculated change
      this.mWeightMatrices[index - 1] = math.add(this.mWeightMatrices[index - 1], weightChangeMatrixLearnRate);
    }
  }
  public calcOutput(inputList: number[]) {
    if (inputList.length !== this.layerNeurons[0]) {
      throw Error('Number of inputs must match number of neurons of the input layer.');
    }
    this.mErrorMatrices = [];
    this.mOutputMatrices = [];
    // make the list to an input matrix
    // prepare the input values by converting the passed over array (row)
    // into a one column matrix for matrices calculation later on
    let currentInputMatrix = math.matrix(math.reshape(inputList, [inputList.length, 1]));
    // the output matrix for the first (input) layer is the input of the NN
    this.mOutputMatrices.push(currentInputMatrix);
    // iterate the weight matrices and calculate the output for each
    this.mWeightMatrices.forEach((weightMatrix) => {
      // matrices product of the weights and input
      const inputWeightProductMatrix = math.multiply(weightMatrix, currentInputMatrix);
      // apply the activation function on each result of the weight x input product
      const outputMatrix: any = math.matrix(inputWeightProductMatrix.map((inputWeightProduct: number) => {
        return this.activationFunc(inputWeightProduct);
      }));
      // set the the calculated output matrix for the current layer as input matrix for the next
      // (will be used in the next iteration)
      currentInputMatrix = outputMatrix;
      // add the output matrix to the list of output matrices
      this.mOutputMatrices.push(outputMatrix);
    });
  }
}
