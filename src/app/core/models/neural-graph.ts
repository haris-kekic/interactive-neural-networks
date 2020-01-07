export interface NeuralGraphNode {
  id: string;
  label: string;
  layer: number;
  value2?: number;
  value1?: number;
  x: number;
  y: number;
}

export class NeuralGraphEdge {
  id: string;
  refId: string;
  sourceLayer: number;
  targetLayer: number;
  value: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  deltaX: number;
  deltaY: number;
  coordinates: string;
  valuePosX: number;
  valuePosY: number;
  valueRotation: number;
}

export interface NeuralGraphLayer {
  nodes: NeuralGraphNode[];
  x: number;
  y: number;
  hasErrorMatrix: boolean;
  hasOutputMatrix: boolean;
  outEdges: NeuralGraphEdge[];
  inEdges: NeuralGraphEdge[];
  outEdgeTop: NeuralGraphEdge;
}

export interface NeuralGraph  {
  edges: NeuralGraphEdge[];
  layers: NeuralGraphLayer[];
  nodes: NeuralGraphNode[][]; // [layer][nodes]
  height: number;
  width: number;
  coordinates: string;
}


