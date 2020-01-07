import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageBoardService {

constructor() { }
  private messageStore: Message[] = [];

  private pMessages = new BehaviorSubject<Message[]>([]);

  postMessage(token: string, params: any) {
    const message = { token, params, isCurrent: true } as Message;
    this.messageStore.forEach((msg) => msg.isCurrent = false);
    this.messageStore.unshift(message);
    this.pMessages.next(Object.assign([], this.messageStore));
  }

  get messages(): Observable<Message[]> {
      return this.pMessages.asObservable();
  }
}
