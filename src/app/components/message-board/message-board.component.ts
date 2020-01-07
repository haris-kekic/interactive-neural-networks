import { Component, OnInit, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { MessageBoardService } from 'src/app/core/services/message-board.service';
import { Observable } from 'rxjs';
import { Message, MessageToken } from '../../core/models/message';
import { NeuralNetworkService } from 'src/app/core/services/neural-network.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'nn-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss']
})
export class MessageBoardComponent implements OnInit {
  public messages: Observable<Message[]>;

  constructor(protected messageService: MessageBoardService, protected neuralNetworkService: NeuralNetworkService) { }

  ngOnInit() {
    this.messages = this.messageService.messages;
  }
}
