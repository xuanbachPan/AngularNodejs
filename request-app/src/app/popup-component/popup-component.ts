import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-component',
  imports: [CommonModule],
  templateUrl: './popup-component.html',
  styleUrl: './popup-component.css',
})
export class PopupComponent {
  constructor(public dialogRef: MatDialogRef<PopupComponent>) {}
  public confirmMessage:string="";
  public titleMessage:string="";
  public showOKbtn: boolean = true;

  clickCancel(){
    this.dialogRef.close(false);
  }

  clickOK(){
    this.dialogRef.close(true);
  }

}
