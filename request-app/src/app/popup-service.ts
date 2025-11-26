import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopupComponent } from './popup-component/popup-component';

type CallbackFunction = (value: any) => void;

@Injectable({
  providedIn: 'root',
})
export class PopupService {

  dialogRef: MatDialogRef<PopupComponent> | undefined;

  constructor(
      public dialog: MatDialog
  ){}

  openPopupWithCallback(popupStrings: string[], callbackData: any, callbackFunc: CallbackFunction){
    this.dialogRef = this.dialog.open(PopupComponent,{ panelClass: 'custom-popup-container', disableClose: false });
    this.dialogRef.componentInstance.titleMessage = popupStrings[0];
    this.dialogRef.componentInstance.confirmMessage = popupStrings[1];
    this.dialogRef.componentInstance.showOKbtn = true;
    this.dialogRef.afterClosed().subscribe(result =>{
      if(result){
        callbackFunc(callbackData);
      }
      else{
        console.log("result: " + result);
      }
      this.dialogRef = undefined;;
    });
  }
  
  openPopup(popupStrings: string[]){
    this.dialogRef = this.dialog.open(PopupComponent,{ panelClass: 'custom-popup-container', disableClose: false });
    this.dialogRef.componentInstance.titleMessage = popupStrings[0];
    this.dialogRef.componentInstance.confirmMessage = popupStrings[1];
    this.dialogRef.componentInstance.showOKbtn = false;
  }
  
}
