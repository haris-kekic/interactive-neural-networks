import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParsingService {

constructor() { }

parseCsvFile(csv: string): Observable<string[][]> {
  return new Observable<string[][]>((observer) => {
    const lines = csv.split(/\r?\n/g); // for both \n and \r\n
    const result: string[][] = [];
    for (const line of lines) {
        const values = line.split(',');
        // if a line is empty or if it contains just one empty value, then jump over it.
        // the second case can take place if the user adds a new line at the end of the csv
        // which is very common.
        if (values.length === 0 || (values.length === 1 && values[0] === '')) {
          continue;
        }
        result.push(values);
    }


    observer.next(result);
    observer.complete();
  });
}

}
