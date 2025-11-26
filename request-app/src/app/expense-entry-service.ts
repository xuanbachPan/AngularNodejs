import { inject, Injectable } from '@angular/core';
import ExpenseEntryComponent from './expense-entry-component';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators'; 
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest, HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { PopupService } from './popup-service'; 
import { ResResultInterface } from './res-result-interface';
import { FormsModule } from "@angular/forms";


@Injectable({
  providedIn: 'root',

})
export class ExpenseEntryService {
   private nodeJSHost = "http://localhost:8000";
   private httpOptions = {
     headers: new HttpHeaders({'Content-Type': 'application/json'}),
   }; 
   // private httpOptionsOne = {
   //   headers: new HttpHeaders({'Content-Type': 'application/json'}),
   //   observe: new Event('"body"'),
   //   responseType: 'json',
   //   reportProgress: true
   // };

   private popupService = inject(PopupService);

   constructor(private httpClient : HttpClient) {}

   getExpenseEntries() : Observable<ResResultInterface> {
      return this.httpClient.get<ResResultInterface>(this.nodeJSHost + "/api/expense", this.httpOptions)
      .pipe(
         retry(1),
         catchError(this.httpErrorHandler.bind(this))
      );
   }

   getExpenseEntry(id: number) : Observable<ResResultInterface> {
      return this.httpClient.get<ResResultInterface> (this.nodeJSHost + "/api/expense/" + id, this.httpOptions)
      .pipe(
         retry(1),
         catchError(this.httpErrorHandler.bind(this))
      );
   }

   updateExpenseEntry(data:ExpenseEntryComponent) :Observable<ResResultInterface>{
      return this.httpClient.put<ResResultInterface>(this.nodeJSHost + "/api/expense/" + data.id.toString(),   //
         data, {headers: new HttpHeaders({'Content-Type': 'application/json'}), observe: 'body', responseType: 'json', reportProgress: true})
      .pipe(
         retry(1),
         catchError(this.httpErrorHandler.bind(this))
      );
   }

   insertExpenseEntries(data:ExpenseEntryComponent[]) :Observable<ResResultInterface>{
      return this.httpClient.post<ResResultInterface> (this.nodeJSHost + "/api/expense-multi",
         data, {headers: new HttpHeaders({'Content-Type': 'application/json'}), observe: 'body', responseType: 'json', reportProgress: true})
      .pipe(
         retry(1),
         catchError(this.httpErrorHandler.bind(this))
      );
   }

   deleteExpenseEntry(id:number) : Observable<ResResultInterface>{
      return this.httpClient.delete<ResResultInterface> (this.nodeJSHost + "/api/expense/" + id.toString(),
      {headers: new HttpHeaders({'Content-Type': 'application/json'}), observe: 'body', responseType: 'json', reportProgress: true})
      .pipe(
         retry(1),
         catchError(this.httpErrorHandler.bind(this))
      );
   }

   upload(file: File) : String {
      const formData: FormData = new FormData();
      let message : String = "";
      formData.append('photo', file as Blob, file?.name);
      const myObservable: Observable<HttpEvent<any>> = 
         this.httpClient.post<any>(this.nodeJSHost + "/api/upload",
         formData, { observe: 'events', reportProgress: true });
      
      console.log('Hi');
      
      myObservable.pipe(
         map(data => { console.log(data); return data; }),
         ).subscribe(
            evt => { 
               message = this.getEventMessage(evt, file as File)
            });
      
      return message;
   }

   private getEventMessage(event: HttpEvent<any>, file?: File) {
      let message : String | null = null;
      switch (event.type) {
         case HttpEventType.Sent:
            message = 
			`Uploading file "${file?.name}" of size ${file?.size}.`;
            console.log(message);
            return message;
      
         case HttpEventType.UploadProgress:
            // Compute and show the % done:
            const percentDone = 
			event.total ? Math.round(100 * event.loaded / event.total) : 0;
            message = `File "${file?.name}" is ${percentDone}% uploaded.`;
            console.log(message);
            return message;
      
         case HttpEventType.Response:
            message = 
			`File "${file?.name}" was completely uploaded!`;
            console.log(message);
            return message;
      
         default:
            message = 
			`File "${file?.name}" surprising upload event: ${event.type}.`;
            console.log(message);
            return message;
      }
   }

   private httpErrorHandler (error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
         console.error("A client side error occurs. The error message is " + error.message);
      } else {
         console.error(
            "An error happened in server. The HTTP status code is " 
			+ error.status + " and the error returned is " + error.message);
      }

      console.log("httpErrorHandler this:");
      console.log(this);

      if(this != undefined){
         this.popupService.openPopup(["Error", "The client can't connect to the server."]);
      }

      return throwError("Error occurred. Pleas try again");
   }
}
