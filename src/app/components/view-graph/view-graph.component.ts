import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { GraphManager } from '../../core/manager/graph-manager';
import { NeuralGraph } from '../../core/models/neural-graph';
import { timer, Observable, Subject, from, of, Subscription } from 'rxjs';
import { takeUntil, map, concatMap, delay, max, take, reduce, takeWhile } from 'rxjs/operators';
import { forwardPropagationSignal,
  forwardPropagationActivateLayerNodes,
  forwardPropagationActivateLayerNodeLabels,
  backPropagationActivateLayer,
  backPropagationActivateLayerNodes,
  backPropagationHighlightValueChange,
  AnimationStrings} from '../../core/utils/graph-animations';
import { MessageBoardService } from 'src/app/core/services/message-board.service';
import { MessageToken } from 'src/app/core/models/message';
import { NeuralNetworkService, Sample } from 'src/app/core/services/neural-network.service';
import { PopoverDirective } from 'ngx-bootstrap';
import { ViewBaseComponent } from '../view-base/view-base.component';
import { SampleStorageService } from 'src/app/core/services/sample-storage.service';
import { NeuralNetworkMatrices, NeuralNetworkPhase } from 'src/app/core/models/artifacts';


@Component({
  selector: 'nn-view-graph',
  templateUrl: './view-graph.component.html',
  styleUrls: ['./view-graph.component.scss'],
  animations: [
    forwardPropagationSignal,
    forwardPropagationActivateLayerNodes,
    forwardPropagationActivateLayerNodeLabels,
    backPropagationActivateLayer,
    backPropagationActivateLayerNodes,
    backPropagationHighlightValueChange
  ]
})
export class ViewGraphComponent extends ViewBaseComponent implements OnInit, OnChanges, OnDestroy {


  matrices: NeuralNetworkMatrices;

  mode: NeuralNetworkPhase;

  neuralGraph: NeuralGraph;

  storageService: SampleStorageService;

  unprocessedSamples: Observable<Sample[]>;



  forwardPropagationSourceLayer;
  forwardPropagationActiveLayer;
  backPropagationSourceLayer;
  backPropagationActiveLayer;

  firedEvents: [string, number][] = [];

  graphManager: GraphManager = new GraphManager();

  animationStrings = AnimationStrings; // To be able to use enum in HTML Template

  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;

  @Input() isHidden: boolean;

  constructor(protected neuralNetworkService: NeuralNetworkService) {
    super();
  }

  ngOnInit() {
    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.storageServiceSet.subscribe((result) => {
      this.storageService = result;
      this.unprocessedSamples = this.storageService.nextUnprocessedSamples;
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.initialization.subscribe((result) => {
      this.matrices = result.matrices;
      this.neuralGraph = this.graphManager.createGraph(result.layerNeurons,
                                                        result.activationFormulas,
                                                        result.inputLabels,
                                                        result.outputLabels,
                                                        this.matrices.weightMatrices);
    },
    (err) => console.error(err));

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.samplePropagationStart.subscribe(() => {
      this.firedEvents = [];
      this.matrices.outputMatrices.splice(0, this.matrices.outputMatrices.length);
      this.matrices.errorMatrices.splice(0, this.matrices.errorMatrices.length);
      this.graphManager.clearCalculatedValues(this.neuralGraph);
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.forwardPropagation.subscribe((result) => {
      this.matrices.outputMatrices = result.matrices.outputMatrices;
      this.forwardPropagationActivateLayer(result.layer);
    });

    this.subscriptions[this.subscriptions.length] = this.neuralNetworkService.backPropagation.subscribe((result) => {
      this.matrices.weightMatrices = result.matrices.weightMatrices;
      this.matrices.errorMatrices = result.matrices.errorMatrices;
      this.backPropagationActivateLayer(result.layer);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isHidden != null) {
      this.closeOpenPopover();
    }
  }

  forwardPropagationActivateLayer(layer: number) {
    if (layer >= this.neuralGraph.nodes.length) {
      return;
    }

    this.forwardPropagationSourceLayer = layer - 1;
    if (layer === 0) {
      this.forwardPropagationActiveLayer = 0;
      this.graphManager.updateLayerNodeOutputs(this.neuralGraph,
                                                this.matrices.outputMatrices,
                                                this.forwardPropagationActiveLayer);
    }
  }

  // Callback SIGNAL END
  onForwardPropagationSignalSendFinished(event: AnimationEvent, layer: number) {
    const fullEvent = event as any;
    // Callback is called on each edge that gets signal passed through.
    // Prevent further processing of this callback if it was already called for a edge.
    // That means, when the targetLayer of the edge is equal or greater then the current activated, then
    // this callback was already processed for that layer.
    if (fullEvent.toState !== AnimationStrings.STATE_FORWARD_SIGNAL
      || this.firedEvents.some(e => e[0] === AnimationStrings.STATE_FORWARD_SIGNAL && e[1] === layer)) {
      return;
    }

    setTimeout(() => {
      // highlight nodes on layer "forwardPropagationActiveLayer"
      this.forwardPropagationActiveLayer = this.forwardPropagationSourceLayer + 1;
       // Set output values over nodes
      this.graphManager.updateLayerNodeOutputs(this.neuralGraph,
                    this.matrices.outputMatrices,
                    this.forwardPropagationActiveLayer);

    });

    this.firedEvents.push([AnimationStrings.STATE_FORWARD_SIGNAL, layer]);
  }

  // Callback Node Highliting END
  onForwardPropagationNodesActivated(event: AnimationEvent, layer: number) {
    const fullEvent = event as any;
    // Callback is called on each node that gets activated.
    // Prevent further processing of this callback if it was already called for a node in the layer.
    // That means, when the nodeIndex is other then 0
    if (fullEvent.toState !== AnimationStrings.STATE_FORWARD_ACTIVE
        || this.firedEvents.some(e => e[0] === AnimationStrings.STATE_FORWARD_ACTIVE && e[1] === layer)) {
      return;
    }

    this.firedEvents.push([AnimationStrings.STATE_FORWARD_ACTIVE, layer]);
  }

  backPropagationActivateLayer(layer: number) {
    if (layer < 0) {
      return;
    }

    this.backPropagationActiveLayer = layer;
    if (layer === (this.neuralGraph.nodes.length - 1)) {
      this.backPropagationSourceLayer = this.neuralGraph.nodes.length;
    }

    this.graphManager.updateLayerNodeErrors(this.neuralGraph,
      this.matrices.errorMatrices,
      this.backPropagationActiveLayer);
  }

  // Callback
  onBackPropagationLayerActivated(event: AnimationEvent, layer: number) {
    const fullEvent = event as any;
    if (fullEvent.toState !== AnimationStrings.STATE_BACKWARD_ACTIVE
      || this.firedEvents.some(e => e[0] === AnimationStrings.STATE_BACKWARD_ACTIVE && e[1] === layer)) {
     return;
    }

    // SetTimeout to prevent race conditions in rendering
    setTimeout(() => {
      this.backPropagationSourceLayer = this.backPropagationActiveLayer;
      this.graphManager.updateEdgeWeights(this.neuralGraph, this.matrices.weightMatrices, this.backPropagationActiveLayer);
    });

    this.firedEvents.push([AnimationStrings.STATE_BACKWARD_ACTIVE, layer]);
  }

  onBackPropagationSignalSendFinished(event: AnimationEvent, layer: number) {
    const fullEvent = event as any;
    if (fullEvent.toState !== AnimationStrings.STATE_BACKWARD_SIGNAL
      || this.firedEvents.some(e => e[0] === AnimationStrings.STATE_BACKWARD_SIGNAL && e[1] === layer)) {
     return;
    }

    this.firedEvents.push([AnimationStrings.STATE_BACKWARD_SIGNAL, layer]);
  }

  closeOpenPopover() {
    if (this.popovers == null) {
      return;
    }
    this.popovers.forEach((popover) => popover.hide());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getCurrentUrl() {
    return window.location.href;
  }

}
