import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numtoarray'
})
export class NumberToArrayPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    return new Array(value);
  }

}
