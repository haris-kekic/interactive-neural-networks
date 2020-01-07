import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

export enum DialogType {
  WARNING,
  INFO,
  QUESTION,
  ERROR
}

export enum DialogResult {
  OK,
  YES,
  NO
}

export interface DialogOptions {
  type: DialogType;
  title: string;
  message: string;
}

@Component({
  selector: 'nn-dialog-modal',
  templateUrl: './dialog-modal.component.html',
  styleUrls: ['./dialog-modal.component.scss']
})
export class DialogModalComponent implements OnInit {

  options: DialogOptions;

  dialogType = DialogType;

  dialogResult: DialogResult;

  @Output() action = new EventEmitter<DialogResult>();

  constructor(protected modalRef: BsModalRef) { }

  ngOnInit() {}

  ok() {
    this.modalRef.hide();
    this.action.emit(DialogResult.OK);
  }

  yes() {
    this.modalRef.hide();
    this.action.emit(DialogResult.YES);
  }

  no() {
    this.modalRef.hide();
    this.action.emit(DialogResult.NO);
  }
}
