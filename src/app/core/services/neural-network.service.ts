import { Injectable } from '@angular/core';
import { NeuralNetwork } from '../models/neural-network';
import { Subject, BehaviorSubject, iif, concat, bindCallback} from 'rxjs';
import { takeUntil, tap, repeat, delay } from 'rxjs/operators';
import { SampleStorageService } from './sample-storage.service';
import { NeuralNetworkMatrices,
          NeuralNetworkConfig,
          NeuralNetworkDatasetConfig,
          PropagationStepResult,
          PropagationDirection,
          NeuralNetworkMode } from '../models/artifacts';

export interface InitResult {
  layerNeurons: number[];
  matrices: NeuralNetworkMatrices;
}

export interface PropagationOptions {
  isContinous: boolean;
  delay: number;
  skipPropagationStepNotification: boolean; // should the observers be notified when steping activating individual layers
  skipSampleFinishNotification: boolean; // should the observers be notified when finishing sample
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

@Injectable({ providedIn: 'root' })
export class NeuralNetworkService {

  private propagationOptions: PropagationOptions = { delay: 0,
                                                     isContinous: false,
                                                    skipPropagationStepNotification: false,
                                                    skipSampleFinishNotification: false };
  private pIsInitialized = false;

  private initSub = new BehaviorSubject(null);
  private initTrainingSub = new BehaviorSubject(null);
  private forwardPropagationSub = new Subject<PropagationResult>();
  private backPropagationSub = new Subject<PropagationResult>();
  private propagationStopSub = new Subject<PropagationResult>();
  private samplePropagationStartSub = new Subject();
  private samplePropagationEndSub = new Subject<PropagationResult>();
  private sampleSetCompletedSub = new Subject<boolean>();
  private isProcessingSub = new BehaviorSubject<boolean>(false);
  private workingStorageServiceSetSub = new BehaviorSubject<SampleStorageService>(null);
  private globalSetsErrorsSub = new Subject<number[]>();

  private neuralNetwork: NeuralNetwork;
  private storageService: SampleStorageService;
  private processingSample: Sample;
  private processingMode: NeuralNetworkMode;
  private errorCalcSampleSets: Sample[][] = [];

  public readonly initialization = this.initSub.asObservable();
  public readonly initializationTraining = this.initTrainingSub.asObservable();
  public readonly forwardPropagation = this.forwardPropagationSub.asObservable();
  public readonly backPropagation = this.backPropagationSub.asObservable();
  public readonly propagationStop = this.propagationStopSub.asObservable();
  public readonly samplePropagationStart = this.samplePropagationStartSub.asObservable();
  public readonly samplePropagationEnd = this.samplePropagationEndSub.asObservable();
  public readonly sampleSetCompleted = this.sampleSetCompletedSub.asObservable();
  public readonly isProcessing = this.isProcessingSub.asObservable();
  public readonly workingStorageServiceSet = this.workingStorageServiceSetSub.asObservable();
  public readonly globalSetsErrorsCalculated = this.globalSetsErrorsSub.asObservable();

  public get isInitialized(): boolean { return this.pIsInitialized; }

  constructor() { }

  public setNeuralNetwork(neuralNetwork: NeuralNetwork) {
    this.neuralNetwork = neuralNetwork;
  }

  // set the storage service which will be used for processing
  public setWorkingStorage(sampleStorageService: SampleStorageService, mode: NeuralNetworkMode) {
    this.processingMode = mode;
    this.processingSample = null;
    this.storageService = sampleStorageService;
    this.storageService.pull();
    this.workingStorageServiceSetSub.next(this.storageService);
  }

  public resetWorkingStorage() {
    this.storageService.resetProcessing();
    this.setWorkingStorage(this.storageService, this.processingMode);
  }

    // Mainly for error calculation
  public set errorCalculationSampleSets(sampleSet: Sample[][]) {
      this.errorCalcSampleSets = [... sampleSet.map(s => s.map(sample => {
                                                              return { id: sample.id,
                                                                      input: [...sample.input],
                                                                      output: (sample.output != null ? [...sample.output] : null) };
                                                                }
                ))];
  }

  // calculates errors on the sets provided in errorCalcSampleSets
  // return an array of errors for each set
  public calcGlobalSetsErrors() {
    if (this.errorCalcSampleSets.length === 0) {
      return;
    }

    const errors: number[] = [];

    this.errorCalcSampleSets.forEach((samples) => {
      let error = 0;
      samples.forEach((sample) => {
        this.neuralNetwork.reset();
        this.neuralNetwork.output(sample.input, sample.output);
        error += this.neuralNetwork.sampleError;
      });

      error /= samples.length;
      errors[errors.length] = error;
    });

    this.globalSetsErrorsSub.next(errors);
  }

  public initialize(config: NeuralNetworkConfig) {
    try {
      this.neuralNetwork.init(config);
      const initResult = {  inputLabels: [... this.neuralNetwork.currentNetworkConfig.inputLabels],
                            outputLabels: [... this.neuralNetwork.currentNetworkConfig.outputLabels],
                            activationFormulas: [...this.neuralNetwork.currentNetworkConfig.layers.map(l => l.activation.funcFormula)],
                            layerNeurons: [...this.neuralNetwork.currentNetworkConfig.layers.map(l => l.neuronCount)],
                            matrices: {...this.neuralNetwork.matrices },
                            errorFormula: this.neuralNetwork.currentNetworkConfig.errorFormula  };
      this.pIsInitialized = true;
      this.initSub.next(initResult);

    } catch (err) {
      this.initSub.error(err);
    }
  }

  public initializePropagation(config: NeuralNetworkDatasetConfig) {
    try {
      this.neuralNetwork.initPropagation(config);
      const initResult = { learnRate: config.learnRate };
      this.initTrainingSub.next(initResult);

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
          .propagateSampleStep(this.processingMode === NeuralNetworkMode.TRAINING) // do backprop also!
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
        if (this.propagationOptions.skipPropagationStepNotification) {
          break;
        }
        this.forwardPropagationSub.next({ layer: propResult.layer,
                                          matrices: Object.assign({}, this.neuralNetwork.matrices),
                                          options: Object.assign({}, this.propagationOptions) });
        break;
      case PropagationDirection.BACKPROPAGATION:
        if (this.propagationOptions.skipPropagationStepNotification) {
          break;
        }
        this.backPropagationSub.next({ layer: propResult.layer,
                                        matrices: Object.assign({}, this.neuralNetwork.matrices),
                                        options: Object.assign({}, this.propagationOptions) });
        break;
      case PropagationDirection.FINISHED:
        this.storageService.sampleProcessed(this.processingSample.id);
        this.processingSample = null;
        this.calcGlobalSetsErrors();

        if (this.propagationOptions.skipSampleFinishNotification) {
          this.neuralNetwork.reset();
          break;
        }
        this.samplePropagationEndSub.next({ layer: propResult.layer,
                                            matrices: Object.assign({}, this.neuralNetwork.matrices),
                                            options: Object.assign({}, this.propagationOptions) });

        this.sampleSetCompletedSub.next(this.storageService.storageCompleted);

        if (this.storageService.storageCompleted) {
          this.resetWorkingStorage();
        }

        this.neuralNetwork.reset();
    }
  }
}
