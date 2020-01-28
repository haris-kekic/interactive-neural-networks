import { Injectable, Input } from '@angular/core';
import { Sample } from './neural-network.service';
import { Observable, from, EMPTY, ArgumentOutOfRangeError, EmptyError, BehaviorSubject } from 'rxjs';
import { last, map, concatMap, take, elementAt, takeWhile, tap, count, catchError, defaultIfEmpty, first, filter } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import { NeuralNetworkMode } from '../models/artifacts';


export abstract class SampleStorageService {
  protected persistentSampleStore: Sample[] = [];
  protected workingSampleStore: Sample[] = [];
  protected processedSampleIdStore: string[] = [];
  protected pNextUnprocessedSamples = new BehaviorSubject<Sample[]>([]);
  protected pSamples = new BehaviorSubject<Sample[]>([]);
  protected pSampleCount = new BehaviorSubject<number>(0);
  protected pProcessedSampleCount = new BehaviorSubject<number>(0);
  protected pHasSamples = new BehaviorSubject<boolean>(false);
  public token: NeuralNetworkMode;
  public nextSamplesCount = 3;

  public get samples() {
    return this.pSamples.asObservable();
  }

  public get sampleCount() {
    return this.pSampleCount.asObservable();
  }

  public get processedSampleCount() {
    return this.pProcessedSampleCount.asObservable();
  }

  public get hasSamples() {
    return this.pHasSamples.asObservable();
  }

  public get nextUnprocessedSamples() {
    return this.pNextUnprocessedSamples.asObservable();
  }

  public get storageCompleted() {
    return this.workingSampleStore.length === this.processedSampleIdStore.length;
  }

  constructor() { }

  public push() {
    // push the data from working store to the persistance with deep copy
    this.persistentSampleStore = [...this.workingSampleStore.map((sample) => {
                                            return { id: sample.id,
                                                     input: [...sample.input],
                                                     output: (sample.output != null ? [...sample.output] : null) };
                                          })
                                 ];
    this.workingSampleStore.splice(0, this.workingSampleStore.length);
    this.processedSampleIdStore.splice(0, this.processedSampleIdStore.length);
  }

  public pull() {
    // pull the data from persistance store to the working store with deep copy
    this.workingSampleStore = [...this.persistentSampleStore.map((sample) => {
                                            return { id: sample.id,
                                                    input: [...sample.input],
                                                    output: (sample.output != null ? [...sample.output] : null) };
                                          })
                              ];
    this.pNextUnprocessedSamples.next(this.workingSampleStore
                                          .filter(sample => !this.processedSampleIdStore.some((sampleId) => sample.id === sampleId))
                                          .slice(0, 3));
    this.notifyObservers();
  }

  public addSample(sample: Sample) {
    sample.id = UUID.UUID();
    this.workingSampleStore.push(sample); // add at first position
    this.notifyObservers();
  }

  public addSamples(samples: Sample[]) {
    const workingSamples = samples.map(s => {
                                  return { id: UUID.UUID(), input: [... s.input], output: [... s.output] } as Sample; });
    this.workingSampleStore = [... workingSamples];
    this.notifyObservers();
  }

  public shuffleSamples() {
    for (let i = this.workingSampleStore.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.workingSampleStore[i], this.workingSampleStore[j]] = [this.workingSampleStore[j], this.workingSampleStore[i]];
  }
  }

  public clear() {
    this.workingSampleStore.splice(0, this.workingSampleStore.length);
    this.notifyObservers();
  }

  public resetProcessing() {
    this.processedSampleIdStore.splice(0, this.processedSampleIdStore.length);
  }

  public aquireNextSample(): Observable<Sample> {
    const observable = from(this.workingSampleStore)
    .pipe(first(sample => !this.processedSampleIdStore.some((sampleId) => sample.id === sampleId)))
    .pipe(catchError((error) => {
      if (error instanceof EmptyError) {
        return EMPTY;
      }
      throw Error(error);
    }));

    return observable;
  }


  public sampleProcessed(id: string) {
    const samples = this.workingSampleStore.filter((ws) => ws.id === id);
    if (samples.length === 0) {
      throw Error(`Sample '${id}' not found!`);
    }

    this.processedSampleIdStore.push(id);

    this.pNextUnprocessedSamples.next(this.getUnprocessedSamples(3));

    this.pProcessedSampleCount.next(this.processedSampleIdStore.length);
  }

  private getUnprocessedSamples(takeCount: number) {
    return this.workingSampleStore
    .filter(sample => !this.processedSampleIdStore.some((sampleId) => sample.id === sampleId))
    .slice(0, takeCount);
  }

  private notifyObservers() {
    this.pSamples.next(this.workingSampleStore);
    this.pSampleCount.next(this.workingSampleStore.length);
    this.pHasSamples.next(this.workingSampleStore.length > 0);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TrainingSampleStorageService extends SampleStorageService {
  token = NeuralNetworkMode.TRAINING;
}

@Injectable({
  providedIn: 'root'
})
export class TestSampleStorageService extends SampleStorageService {
  token = NeuralNetworkMode.TEST;
}

@Injectable({
  providedIn: 'root'
})
export class StorageSelectorService {
  protected storageServices: SampleStorageService[] = [];
  constructor(trainingStorageService: TrainingSampleStorageService,
              executionStorageService: TestSampleStorageService) {
                this.storageServices.push(trainingStorageService);
                this.storageServices.push(executionStorageService);
              }
  getService(phase: NeuralNetworkMode) {
    return this.storageServices.find((service) => service.token === phase);
  }
}




