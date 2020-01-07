import { Component, OnInit, Input } from '@angular/core';
import { Message } from '../../core/models/message';
import { transition, style, animate, trigger, group } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'nn-message-board-item',
  templateUrl: './message-board-item.component.html',
  styleUrls: ['./message-board-item.component.scss'],
  animations: [
    trigger('appearance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        group([
        animate('0.5s', style({ transform: 'scale(1)' })),
        animate('0.5s', style({ opacity: 1 }))
        ])
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MessageBoardItemComponent implements OnInit {

  @Input() message: Message;

  constructor() { }

  ngOnInit() {
  }

}
