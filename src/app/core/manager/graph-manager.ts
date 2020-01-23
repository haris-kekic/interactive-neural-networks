import * as math from 'mathjs';
import { NeuralGraph, NeuralGraphLayer, NeuralGraphEdge, NeuralGraphNode } from '../models/neural-graph';

export interface NeuralGraphVisualConfig {
  viewPortSize?: [number, number]; // [width, height]
  margins?: [number, number, number, number]; // [left, top, right, bottom]
  maxNodesDistance?: number;
  layerDistance?: number;
}

const configDefaults: NeuralGraphVisualConfig = {
  viewPortSize: [1500, 800],
  margins: [50, 100, 0, 0],
  maxNodesDistance: 400,
  layerDistance: null
};

export class GraphManager {
  constructor(public config?: NeuralGraphVisualConfig) { this.config = {...configDefaults, ...config }; }

  createGraph(layerNeurons: number[],
              activationFromulas: string[],
              inputLabels: string[],
              outputLabels: string[],
              weightMatrices: number[][][]): NeuralGraph {

    const neuralGraph: NeuralGraph = { layers: [],
                                        edges: [],
                                        nodes: [],
                                        height: 0,
                                        width: 0,
                                        coordinates: '',
                                        inputLabels,
                                        outputLabels };

    const maxNeuronsLayer = math.max(layerNeurons);
    const nodeDistance = this.config.maxNodesDistance;

    const layerDistance = this.config.layerDistance != null
                            ? this.config.layerDistance
                            : (this.config.viewPortSize[0] * 2) / layerNeurons.length;

    neuralGraph.width = layerDistance * (layerNeurons.length - 1) + this.config.margins[2];
    neuralGraph.height = maxNeuronsLayer * this.config.maxNodesDistance + this.config.margins[3];
    neuralGraph.coordinates = `0 0 ${neuralGraph.width} ${neuralGraph.height}`;

    layerNeurons.forEach((neuronCount, layerIndex) => {
      const graphLayer = { nodes: [], outEdges: [], inEdges: [], activationFormula: activationFromulas[layerIndex] } as NeuralGraphLayer;
      neuralGraph.nodes[layerIndex] = [];

      const graphLayerX = (layerIndex + 1) * layerDistance + this.config.margins[0];

      const firstNodeOffset = neuronCount === maxNeuronsLayer ? nodeDistance : (nodeDistance / 2);

      let thisLayerNodePosition = (maxNeuronsLayer - neuronCount) *  firstNodeOffset + this.config.margins[1];

      graphLayer.x = graphLayerX;
      graphLayer.y = thisLayerNodePosition - 100;

      for (let nodeIndex = 0; nodeIndex < neuronCount; nodeIndex++) {
        const graphNodeY = thisLayerNodePosition;
        const graphNode = { id: `L${layerIndex}-N${nodeIndex}`, x: graphLayerX, y: graphNodeY, layer: layerIndex } as NeuralGraphNode;
        graphLayer.nodes.push(graphNode);

        neuralGraph.nodes[layerIndex][nodeIndex] = graphNode;

        thisLayerNodePosition += nodeDistance;
      }

      neuralGraph.layers.push(graphLayer);
    });

    weightMatrices.forEach((matrix, matrixIndex, matrices) => {
      for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
        for (let colIndex = 0; colIndex < matrix[rowIndex].length; colIndex++) {
          const sourceLayerIndex = matrixIndex;
          const nextLayerIndex = matrixIndex + 1;
          const weightValue = matrix[rowIndex][colIndex];
          // nodes from input layer are columns in weight matrix, nodes from next layer are rows
          const sourceNode = neuralGraph.nodes[sourceLayerIndex][colIndex]; // node from first layer
          const targetNode = neuralGraph.nodes[nextLayerIndex][rowIndex]; // node from next layer
          const edge = { id: `L${matrixIndex}N${colIndex}-L${matrixIndex + 1}N${rowIndex}`,
                        sourceLayer: sourceLayerIndex,
                        targetLayer: nextLayerIndex } as NeuralGraphEdge;

          edge.x1 = sourceNode.x;
          edge.y1 = sourceNode.y;
          edge.x2 = targetNode.x;
          edge.y2 = targetNode.y;
          edge.deltaX = edge.x2 - edge.x1;
          edge.deltaY = edge.y2 - edge.y1;
          edge.refId = '#' + edge.id;
          const xHalf = Math.floor(edge.x1 + (edge.x2 - edge.x1) / 2);
          const yHalf = Math.floor(edge.y1 + (edge.y2 - edge.y1) / 2);
          // the final line consist of two lines in order to place arrow as marker in the middle
          edge.coordinates = `M ${edge.x1} ${edge.y1} L ${xHalf} ${yHalf} L ${edge.x2} ${edge.y2}`;
          edge.value = weightValue;
          edge.valuePosX = xHalf; // for better view, we go -50px to the left of the line, so the values don't all meet in the middle
          edge.valuePosY = yHalf; // for better view, we go -20px above the line, so that the values don't all meet in the middle
          // we calculate arctan and get the radian of the edge.
          // in order to convert it to degree (as needed by svg text), just calc * 180/PI
          edge.valueRotation = math.atan(edge.deltaY / edge.deltaX) * 180 / math.pi;
          neuralGraph.edges.push(edge);

          neuralGraph.layers[sourceLayerIndex].outEdges.push(edge);
          neuralGraph.layers[nextLayerIndex].inEdges.push(edge);
        }
      }
    });

    // identify top edge in layer
    neuralGraph.layers.forEach((layer) => {
      if (layer.outEdges === null || layer.outEdges.length === 0) {
        return;
      }
      const minSourceY = math.min(layer.outEdges.map(edge => edge.y1));
      const minTargetY = math.min(layer.outEdges.map(edge => edge.y2));
      const topEdges = layer.outEdges.filter(edge => edge.y1 === minSourceY && edge.y2 === minTargetY);
      layer.outEdgeTop = topEdges != null && topEdges.length > 0 ? topEdges[0] : null;
    });

    return neuralGraph;
  }

  clearCalculatedValues(neuralGraph: NeuralGraph) {

    neuralGraph.layers.forEach((layer) => {
      layer.nodes.forEach((node) => {
        node.value1 = null;
        node.value2 = null;
      });

      layer.hasOutputMatrix = false;
      layer.hasErrorMatrix = false;
    });
  }

  updateLayerNodeOutputs(neuralGraph: NeuralGraph, outputMatrix: number[][][], layer: number) {
    const matrix = outputMatrix[layer];
    neuralGraph.nodes[layer].forEach((node, index) => {
      node.value2 = matrix[index][0];
    });

    neuralGraph.layers[layer].hasOutputMatrix = true;
  }

  updateLayerNodeErrors(neuralGraph: NeuralGraph, errorMatrix: number[][][], layer: number) {
    const matrix = errorMatrix[layer];
    neuralGraph.nodes[layer].forEach((node, index) => {
      node.value1 = matrix[index][0];
    });

    neuralGraph.layers[layer].hasErrorMatrix = true;
  }

  updateAllEdgeWeights(neuralGraph: NeuralGraph, weightMatrices: number[][][]) {
    for (let layer = weightMatrices.length; layer > 0; layer--) {
      this.updateEdgeWeights(neuralGraph, weightMatrices, layer);
    }
  }

  updateEdgeWeights(neuralGraph: NeuralGraph, weightMatrices: number[][][], layer: number) {
    const sourceLayer = layer - 1;
    const targetLayer = layer;
    const matrix = weightMatrices[sourceLayer];
    for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
        for (let colIndex = 0; colIndex < matrix[rowIndex].length; colIndex++) {
          // edge id constist of: (SOURCE LAYER INDEX)(INPUT NEURON INDEX)-(TARGET LAYER INDEX)(OUTPUT NEURON INDEX)
          const id = `L${sourceLayer}N${colIndex}-L${targetLayer}N${rowIndex}`;
          const edge = neuralGraph.edges.find(e => e.id === id);
          if (edge != null) {
            edge.value = matrix[rowIndex][colIndex];
          }
        }
      }
  }
}
