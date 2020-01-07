export enum MessageToken {
  INITIALIZATION = 'initialization',
  CALCOUTPUT = 'calcoutput',
  BACKPROPAGATION = 'backpropagation'
}


export interface Message {
  token: string;
  params: any;
  isCurrent: boolean;
}
