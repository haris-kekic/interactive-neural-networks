import { Injectable } from '@angular/core';
import { NeuralNetwork } from '../models/neural-network';
import { Subject, BehaviorSubject, iif, concat, bindCallback} from 'rxjs';
import { takeUntil, tap, repeat, delay } from 'rxjs/operators';
import { SampleStorageService } from './sample-storage.service';
import { NeuralNetworkMatrices, NeuralNetworkConfig, NeuralNetworkTrainingConfig, PropagationStepResult, PropagationDirection } from '../models/artifacts';

export interface InitResult {
  layerNeurons: number[];
  matrices: NeuralNetworkMatrices;
}

export interface PropagationOptions {
  isContinous: boolean;
  delay: number;
}

export interface PropagationResult {
  layer: number;
  matrices: NeuralNetworkMatrices;
  options: PropagationOptions;
}

export interface SamplePropagationResult {
  currentSampleError: number;
  globalError: number;
}

export interface Sample {
  id?: string;
  input: number[];
  output: number[];
}


export enum ProcessingMode {
  TRAINING,
  OUTPUT_CALCULATION
}

@Injectable({ providedIn: 'root' })
export class NeuralNetworkService {

  private propagationOptions: PropagationOptions = { delay: 0, isContinous: false };
  private pIsInitialized = false;

  private initSub = new BehaviorSubject(null);
  private initTrainingSub = new BehaviorSubject(null);
  private forwardPropagationSub = new Subject<PropagationResult>();
  private backPropagationSub = new Subject<PropagationResult>();
  private propagationStopSub = new Subject();
  private samplePropagationStartSub = new Subject();
  private samplePropagationEndSub = new Subject<SamplePropagationResult>();
  private isProcessingSub = new BehaviorSubject<boolean>(false);
  private storageServiceSetSub = new BehaviorSubject<SampleStorageService>(null);

  private neuralNetwork: NeuralNetwork;
  private storageService: SampleStorageService;
  private processingSample: Sample;
  private globalError = 0;
  private currentSampleError = 0;

  public readonly initialization = this.initSub.asObservable();
  public readonly initializationTraining = this.initTrainingSub.asObservable();
  public readonly forwardPropagation = this.forwardPropagationSub.asObservable();
  public readonly backPropagation = this.backPropagationSub.asObservable();
  public readonly propagationStop = this.propagationStopSub.asObservable();
  public readonly samplePropagationStart = this.samplePropagationStartSub.asObservable();
  public readonly samplePropagationEnd = this.samplePropagationEndSub.asObservable();
  public readonly isProcessing = this.isProcessingSub.asObservable();
  public readonly storageServiceSet = this.storageServiceSetSub.asObservable();

  public get isInitialized(): boolean { return this.pIsInitialized; }

  constructor() { }

  public setNeuralNetwork(neuralNetwork: NeuralNetwork) {
    this.neuralNetwork = neuralNetwork;
  }

  public setStorage(sampleStorageService: SampleStorageService) {
    this.storageService = sampleStorageService;
    this.storageService.pull();
    this.storageServiceSetSub.next(this.storageService);
  }

  public initialize(config: NeuralNetworkConfig) {
    try {
      this.neuralNetwork.init(config);
      const initResult = { layerNeurons: [...config.layers.map(l => l.neuronCount)], matrices: {...this.neuralNetwork.matrices } };
      this.pIsInitialized = true;
      this.initSub.next(initResult);

    } catch (err) {
      this.initSub.error(err);
    }
  }

  public initializeTraining(config: NeuralNetworkTrainingConfig) {
    try {
      this.neuralNetwork.initTraining(config);
      const initResult = { learnRate: config.learnRate };
      this.initTrainingSub.next(initResult);
      this.storageService.samples.subscribe((samples) => {
        this.neuralNetwork.reset();
        this.neuralNetwork.propagateSampleStep()
      });
    } catch (err) {
      this.initTrainingSub.error(err);
    }
  }

  public stopPropagation() {
    this.propagationStopSub.next();
    this.isProcessingSub.next(false);
  }

  public propagate(options?: PropagationOptions) {
    if (this.storageService === null) {
      throw Error('No sample storage set for neural network!');
    }

    if (options != null) {
      this.propagationOptions = options;
    }

    this.isProcessingSub.next(true);

    const nextSample = iif(
      () => this.processingSample == null,
      this.storageService.aquireNextSample().pipe(
        tap(sample => {
          this.processingSample = sample;
          this.neuralNetwork.setProcessingSample(sample.input, sample.output);
          this.samplePropagationStartSub.next();
        })
      )
    );
    // make an observable out of the method
    const stopPropagationCallback = bindCallback(this.stopPropagation);

    const propagate = iif(
      () => this.processingSample != null,
      this.neuralNetwork
          .propagateSampleStep()
          .pipe(tap(propResult => this.processPropResult(propResult))),
      stopPropagationCallback.call(this)
    ); // bind "this" and make it accessable in the callback method

    const combiner = concat(nextSample, propagate);

    const executor = iif(
      () => this.propagationOptions.isContinous,
      combiner.pipe(delay(this.propagationOptions.delay)).pipe(repeat()),
      combiner
    );

    executor.pipe(takeUntil(this.propagationStopSub)).subscribe();
  }

  private processPropResult(propResult: PropagationStepResult) {
    switch (propResult.direction) {
      case PropagationDirection.FORWARDPROPAGATION:
        this.forwardPropagationSub.next({ layer: propResult.layer,
                                          matrices: Object.assign({}, this.neuralNetwork.matrices),
                                          options: Object.assign({}, this.propagationOptions) });
        break;
      case PropagationDirection.BACKPROPAGATION:
        this.backPropagationSub.next({ layer: propResult.layer,
                                        matrices: Object.assign({}, this.neuralNetwork.matrices),
                                        options: Object.assign({}, this.propagationOptions) });
        break;
      case PropagationDirection.FINISHED:
        this.storageService.sampleProcessed(this.processingSample.id);
        this.processingSample = null;

        const learnRate = this.neuralNetwork.currentTrainingConfig.learnRate;
        this.globalError += (learnRate) * this.neuralNetwork.sampleDerivativeSum;

        this.neuralNetwork.reset();
        this.samplePropagationEndSub.next({ currentSampleError: this.neuralNetwork.sampleError,
                                            globalError: this.globalError});
    }
  }
}
