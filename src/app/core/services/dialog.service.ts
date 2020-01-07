import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { DialogModalComponent, DialogType, DialogResult } from 'src/app/components/dialog-modal/dialog-modal.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(protected modalService: BsModalService) { }

  info(title: string, message: string) {
    const initParams = { options: { type: DialogType.INFO, title, message } } ;
    const modalRef = this.modalService.show(DialogModalComponent, { class: 'dialog-modal', backdrop: 'static', initialState: initParams });
    return new Promise<DialogResult>((resolve) => modalRef.content.action.subscribe((result) => {
      resolve(result);
    }));
  }

  warning(title: string, message: string) {
    const initParams = { options: { type: DialogType.WARNING, title, message } } ;
    const modalRef = this.modalService.show(DialogModalComponent, { class: 'dialog-modal', backdrop: 'static', initialState: initParams });
    return new Promise<DialogResult>((resolve) => modalRef.content.action.subscribe((result) => {
      resolve(result);
    }));
  }

  error(title: string, message: string) {
    const initParams = { options: { type: DialogType.ERROR, title, message } } ;
    const modalRef = this.modalService.show(DialogModalComponent, { class: 'dialog-modal', backdrop: 'static', initialState: initParams });
    return new Promise<DialogResult>((resolve) => modalRef.content.action.subscribe((result) => {
      resolve(result);
    }));
  }

  question(title: string, message: string) {
    const initParams = { options: { type: DialogType.QUESTION, title, message } } ;
    const modalRef = this.modalService.show(DialogModalComponent, { class: 'dialog-modal', backdrop: 'static', initialState: initParams });
    return new Promise<DialogResult>((resolve) => modalRef.content.action.subscribe((result) => {
      resolve(result);
    }));
  }
}
