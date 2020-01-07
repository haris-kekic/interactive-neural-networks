import { transition, animate, style, trigger, state } from '@angular/animations';

export enum AnimationStrings {
  TRIGGER_FP_SIGNAL_SEND = 'forwardPropagationSignalSend',
  TRIGGER_FP_ACTIVATE_NODES = 'forwardPropagationActivateLayerNodes',
  TRIGGER_FP_ACTIVATE_NODE_LABELS = 'forwardPropagationActivateLayerNodeLabels',
  TRIGGER_BP_ACTIVATE_LAYER = 'backPropagationActivateLayer',
  TRIGGER_BP_ACTIVATE_NODES = 'backPropagationActivateLayerNodes',
  TRIGGER_BP_VALUECHANGE = 'backPropagationHighlightValueChange',
  STATE_FORWARD_ORIGIN = 'forward-origin',
  STATE_FORWARD_SIGNAL = 'forward-signal',
  STATE_FORWARD_ACTIVE = 'forward-active',
  STATE_BACKWARD_ORIGIN = 'backward-origin',
  STATE_BACKWARD_SIGNAL = 'backward-signal',
  STATE_BACKWARD_ACTIVE = 'backward-active',
  STATE_VALUECHANGE = 'valuechange',
}

const Durations = {
  SIGNAL: '600ms',
  NODE_HIGHLIGHTING: '400ms',
  NODE_TEXT_HIGHLIGHTING: '400ms',
  EDGE_TEXT_HIGHLIGHTING: '600ms'
};

export const forwardPropagationSignal = trigger(AnimationStrings.TRIGGER_FP_SIGNAL_SEND,
  [ state(AnimationStrings.STATE_FORWARD_ORIGIN,
          style( { 'transform-origin': '{{originX}}px {{originY}}px' }), { params : { originX: '100', originY: '100' }}),
    transition(`${AnimationStrings.STATE_FORWARD_ORIGIN} => ${AnimationStrings.STATE_FORWARD_SIGNAL}`,
              [ animate(Durations.SIGNAL, style({ transform: 'translate({{deltaX}}px, {{deltaY}}px)' }))],
                {params : { deltaX: '100', deltaY: '100' }})]);

export const forwardPropagationActivateLayerNodes = trigger(AnimationStrings.TRIGGER_FP_ACTIVATE_NODES,
  [ transition(`* -> ${AnimationStrings.STATE_FORWARD_ACTIVE}`,
        [ animate(Durations.NODE_HIGHLIGHTING, style( { fill: '#5CF0FD' })),
          animate(Durations.NODE_HIGHLIGHTING, style( { fill: '#146FB4' }))])]);

export const forwardPropagationActivateLayerNodeLabels = trigger(AnimationStrings.TRIGGER_FP_ACTIVATE_NODE_LABELS, [
  transition(`* -> ${AnimationStrings.STATE_FORWARD_ACTIVE}`,
    [ animate(Durations.NODE_TEXT_HIGHLIGHTING, style( { fill: '#146FB4' })),
      animate(Durations.NODE_TEXT_HIGHLIGHTING, style( { fill: '#5CF0FD' }))])
]);

export const backPropagationActivateLayer = trigger(AnimationStrings.TRIGGER_BP_ACTIVATE_LAYER, [
  state(AnimationStrings.STATE_BACKWARD_ORIGIN,
       style( { 'transform-origin': '{{originX}}px {{originY}}px' }), {params : { originX: '100', originY: '100' }}),
  transition(`${AnimationStrings.STATE_BACKWARD_ORIGIN} => ${AnimationStrings.STATE_BACKWARD_SIGNAL}`,
    [ animate(Durations.SIGNAL, style({ transform: 'translate({{deltaX}}px, {{deltaY}}px)' }))],
              { params : { deltaX: '100', deltaY: '100' }})
    ]);

export const backPropagationActivateLayerNodes =  trigger(AnimationStrings.TRIGGER_BP_ACTIVATE_NODES, [
  transition(`* -> ${AnimationStrings.STATE_BACKWARD_ACTIVE}`,
    [ animate(Durations.NODE_HIGHLIGHTING, style( { fill: '#ff5959' })),
      animate(Durations.NODE_HIGHLIGHTING, style( { fill: '#146FB4' }))])
    ]);

export const backPropagationHighlightValueChange = trigger(AnimationStrings.TRIGGER_BP_VALUECHANGE, [
  transition(`* -> ${AnimationStrings.STATE_VALUECHANGE}`,
        [ animate('500ms ' + Durations.EDGE_TEXT_HIGHLIGHTING, style( { fill: '#ff5959' })),
          animate(Durations.EDGE_TEXT_HIGHLIGHTING, style( { fill: '#fffc59' }))])
        ]);
