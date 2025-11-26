import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  constructor() { }

  info(param: string){
    console.log(param);
  }
}
