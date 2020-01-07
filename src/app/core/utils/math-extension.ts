import { create, all } from 'mathjs';

const config = {
  predictable: true,
  matrix: 'Matrix'
};

export const math = create(all, config);

math.import({
  uniform,
  normal,
  sigmoid,
  ident,
  relu,
  leaky_relu,
  dIdent,
  dSigmoid,
  dTanh,
  dRelu,
  dLeaky_relu,
  applyTo,
});

function applyTo(matrix: any, func: (x: number) => number) {
  const resultMatrix = math.matrix(matrix.map((value: number) => {
    const c = func(value);
    return func(value);
  }));

  return resultMatrix;
}

function uniform(rows: number, cols: number, min: number, max: number) {
  return math.matrix(math.random([rows, cols], min, max));
}

function normal(rows: number, cols: number, min: number, max: number) {
  return math.matrix(math.ones(rows, cols, 'dense').map((value: number) => {
        return value * normalNumber(min, max);
      }));
}

function normalNumber(min: number, max: number) {
  let rand = 0;
  const size = 10;
  for (let i = 0; i < size; i += 1) {
    rand += Math.random();
  }
  rand /= size;
  return Math.floor(min + rand * (max - min + 1));
}

const alpha = 0.01;

function sigmoid(x: number): number {
    return 1 / (1 + math.pow(Math.E, -x));
}

function tanh(x: number): number {
    return (math.pow(Math.E, 2 * x) - 1) / (math.pow(Math.E, 2 * x) + 1);
  }

function ident(x: number): number {
    return x;
  }

function relu(x: number): number {
    return math.max(0, x);
  }

function leaky_relu(x: number): number {
    return x >= 0 ? x : alpha * x;
  }

  // derivatives
function dIdent(x: number): number {
    return 1;
}

function dSigmoid(x: number): number {
    return sigmoid(x) * (1 - sigmoid(x));
  }

function dTanh(x: number): number {
    return 1 - math.pow(tanh(x), 2);
  }

function dRelu(x: number): number {
    return x >= 0 ? 1 : 0;
  }

function dLeaky_relu(x: number): number {
    return x >= 0 ? 1 : alpha;
  }
