import { Component, NgModule, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseEntryService } from '../expense-entry-service';
import { DebugService } from '../debug-service';
import ExpenseEntryComponent from '../expense-entry-component';
import NewRowInterface from '../new-row-interface';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { PopupService } from '../popup-service';
import { BehaviorSubject } from "rxjs";

@Component({
  selector: 'app-expense-entry-list-component',
  templateUrl: './expense-entry-list-component.html',
  imports: [CommonModule],
  styleUrl: './expense-entry-list-component.css',
  providers:[ExpenseEntryService, DebugService, PopupService]
})

export class ExpenseEntryListComponent implements OnInit {

  title: string = "";
  expenseEntries: ExpenseEntryComponent[] = []; 

  constructor(
    private debugService: DebugService, 
    private restService : ExpenseEntryService,
    private popupService: PopupService
  ) { 
    afterNextRender({
      write: () => {},
      read: () => {}  
    });
  }
  
  list:number[] = [];
  file?: File | null = null;
  message : String | null = null;
  noLine: number = 0;
  newRows : NewRowInterface[] = [];
  countNewRow: number = 0;
  editLineNoArr: number[] = [];
  editLineDataArr: ExpenseEntryComponent[] = [];
  addLineDataArr: ExpenseEntryComponent[] = [];
  maxItemID: number = 0;
  currentDate!: Date;
  outerData: BehaviorSubject<any> = new BehaviorSubject<any>({});
  

  ngOnInit() {
    this.debugService.info("Expense Entry List component initialized");
    this.title = "Expense Entry List";
    this.getExpenseItems()    
  }

  getExpenseItems() {
    this.restService.getExpenseEntries()
    .subscribe( data => {
      console.log("getExpenseItems");
      console.log(data);
      if(data.sts_code == 200){
        this.expenseEntries = data.data;
        this.maxItemID = this.findMaxItemID(data.data);
      }
      else{
        this.popupService.openPopup(["Error", "An error occurred while sending the request."]);
      }
    });
  }



  findMaxItemID(data: ExpenseEntryComponent[]) : number{
    return data[data.length-1].id;
  }

  onFilechange(event: any) {
      let files = event.target.files
      this.file = files.item(0)
      console.log(this.file)
  }

  upload() {
    this.message = this.restService.upload(this.file as File);
  }

  editItem(id: number){
    this.editLineNoArr.push(id);
    this.currentDate = new Date();

    let expenseEntry: ExpenseEntryComponent = {
      id:id,
      item: "",
      amount: 0,
      category: "",
      location: "",
      spendOn: this.currentDate,
      createdOn: new Date(0)
    };
    this.editLineDataArr.push(expenseEntry);
  }

  clickDelItem(id: number){
    let popupStrings: string[] = ["Delete Item", `Do you want to delete the item with No:${id.toString()}?`];
    this.popupService.openPopupWithCallback(popupStrings, id, this.delItem.bind(this));
  }

  delItem(id: number){
    console.log(`delete item ${id.toString()}.`);
    this.restService.deleteExpenseEntry(id).subscribe(data=>{
      console.log(data);
      if(data.sts_code == 200){
        this.getExpenseItems();
        this.popupService.openPopup(["Delete Item", `Delete item with No:${id.toString()} successful.`]);
      }
      else{
        this.popupService.openPopup(["Error", "An error occurred while sending the request."]);
      }  
    });   
  }

  clickSaveEditedItem(id: number){
    let popupStrings: string[] = ["Save Edited Item", `Do you want to save the edited item with No:${id.toString()}?`];
    this.popupService.openPopupWithCallback(popupStrings, id, this.saveItem.bind(this));
  }

  saveItem(id: number){
    //check conditions for input fileds
    if((<HTMLInputElement>document.getElementById("item_" + id.toString())).value == ""){
      this.popupService.openPopup(["Invalid Input", "Item is required."]);
      return;
    }
    if((<HTMLInputElement>document.getElementById("amount_" + id.toString())).value == ""){
      this.popupService.openPopup(["Invalid Input", "Amount is required."]);
      return;
    }
    if(Number.isNaN(+(<HTMLInputElement>document.getElementById("amount_" + id.toString())).value)){
      this.popupService.openPopup(["Invalid Input", "Amount data type is number."]);
      return;
    }
    if((<HTMLInputElement>document.getElementById("category_" + id.toString())).value == ""){
      this.popupService.openPopup(["Invalid Input", "Category is required."]);
      return;
    }
    if((<HTMLInputElement>document.getElementById("location_" + id.toString())).value == ""){
      this.popupService.openPopup(["Invalid Input", "Location is required."]);
      return;
    }

    let spendOn: Date = new Date(0);
    spendOn = this.editLineDataArr[this.editLineNoArr.indexOf(id)].spendOn;

    let expenseEntry: ExpenseEntryComponent = {
      id:id,
      item: (<HTMLInputElement>document.getElementById("item_" + id.toString())).value,
      amount: +(<HTMLInputElement>document.getElementById("amount_" + id.toString())).value,
      category: (<HTMLInputElement>document.getElementById("category_" + id.toString())).value,
      location: (<HTMLInputElement>document.getElementById("location_" + id.toString())).value,
      spendOn: spendOn,
      createdOn: new Date(0)
    };
    this.restService.updateExpenseEntry(expenseEntry).subscribe(data=>{
      console.log("saveItem data: ");
      console.log(data);
      if(data.sts_code == 200){
        this.getExpenseItems();
        
        this.editLineNoArr = this.editLineNoArr.filter(item => item != id);
        this.editLineDataArr = this.editLineDataArr.filter(item => item.id != id);
  
        for (let i = 0; i < this.editLineDataArr.length; i++){
          this.editLineDataArr[i].item = (<HTMLInputElement>document.getElementById("item_" +  this.editLineDataArr[i].id.toString())).value;
          this.editLineDataArr[i].amount = +(<HTMLInputElement>document.getElementById("amount_" + this.editLineDataArr[i].id.toString())).value;
          this.editLineDataArr[i].category = (<HTMLInputElement>document.getElementById("category_" + this.editLineDataArr[i].id.toString())).value;
          this.editLineDataArr[i].location = (<HTMLInputElement>document.getElementById("location_" + this.editLineDataArr[i].id.toString())).value;
        }
        this.popupService.openPopup(["Save Item", `Save item with No:${id.toString()} successful.`]);
      }
      else{
        this.popupService.openPopup(["Error", "An error occurred while sending the request."]);
      }      
    });

    
  }

  cancelEditItem(id: number){
    this.editLineNoArr = this.editLineNoArr.filter(item => item != id);
    this.editLineDataArr = this.editLineDataArr.filter(item => item.id != id);
    console.log("editLineNoArr");
    console.log(this.editLineNoArr);
  }

  cancelAddNewItem(id: number){
    if(id==this.countNewRow + this.maxItemID){
      this.countNewRow--;
    }
    this.newRows = this.newRows.filter(item => item.id != id);
    if(this.newRows.length == 0){
      this.countNewRow = 0;
    }
  }

  addItem(){
    this.countNewRow++;
    const newRow = {id: this.countNewRow + this.maxItemID, name: (this.countNewRow + this.maxItemID).toString()};
    this.newRows.push(newRow as NewRowInterface);
    this.currentDate = new Date();
    let expenseEntry: ExpenseEntryComponent = {
      id:0,
      item: "",
      amount: 0,
      category: "",
      location: "",
      spendOn: this.currentDate,
      createdOn: this.currentDate
    };
    this.addLineDataArr.push(expenseEntry);
  }

  clickInsertDatabase(){
    let popupStrings: string[] = ["Insert Items", "Do you want to insert all of these items?"];
    this.popupService.openPopupWithCallback(popupStrings, "", this.insertDatabase.bind(this));
  }

  insertDatabase(param:any){
    let newExpenseEntries: ExpenseEntryComponent[] = [];

    //check conditions for input fileds
    for(let i = 0; i < this.countNewRow; i++){
      if((<HTMLInputElement>document.getElementById("item_" + (i+1+this.maxItemID).toString())).value == ""){
        this.popupService.openPopup(["Invalid Input", "Line New: " + (i+1).toString() + ", item is required."]);
        return;
      }
      if((<HTMLInputElement>document.getElementById("amount_" + (i+1+this.maxItemID).toString())).value == ""){
        this.popupService.openPopup(["Invalid Input", "Line New: " + (i+1).toString() + ", amount is required."]);
        return;
      }
      if(Number.isNaN(+(<HTMLInputElement>document.getElementById("amount_" + (i+1+this.maxItemID).toString())).value)){
        this.popupService.openPopup(["Invalid Input", "Line New: " + (i+1).toString() + ", amount data type is number."]);
        return;
      }
      if((<HTMLInputElement>document.getElementById("category_" + (i+1+this.maxItemID).toString())).value == ""){
        this.popupService.openPopup(["Invalid Input", "Line New: " + (i+1).toString() + ", category is required."]);
        return;
      }
      if((<HTMLInputElement>document.getElementById("location_" + (i+1+this.maxItemID).toString())).value == ""){
        this.popupService.openPopup(["Invalid Input", "Line New: " + (i+1).toString() + ", location is required."]);
        return;
      }
    }

    for (let i = 0; i < this.countNewRow; i++){
      let expenseEntry: ExpenseEntryComponent = {
        id:0,
        item: (<HTMLInputElement>document.getElementById("item_" + (i+1+this.maxItemID).toString())).value,
        amount: +(<HTMLInputElement>document.getElementById("amount_" + (i+1+this.maxItemID).toString())).value,
        category: (<HTMLInputElement>document.getElementById("category_" + (i+1+this.maxItemID).toString())).value,
        location: (<HTMLInputElement>document.getElementById("location_" + (i+1+this.maxItemID).toString())).value,
        spendOn: this.addLineDataArr[i].spendOn,
        createdOn: this.addLineDataArr[i].createdOn
      };
      newExpenseEntries.push(expenseEntry);
    }
    this.restService.insertExpenseEntries(newExpenseEntries).subscribe(data=>{
      console.log("insert multi-data:");
      console.log(data);
      if(data.sts_code == 200){
        this.getExpenseItems();

        this.countNewRow = 0;
        this.newRows.length = 0;
        console.log("editLineNoArr");
        console.log(this.editLineNoArr);
        this.noLine = 0;

        for (let i = 0; i < this.editLineDataArr.length; i++){
          this.editLineDataArr[i].item = (<HTMLInputElement>document.getElementById("item_" +  this.editLineDataArr[i].id.toString())).value;
          this.editLineDataArr[i].amount = +(<HTMLInputElement>document.getElementById("amount_" + this.editLineDataArr[i].id.toString())).value;
          this.editLineDataArr[i].category = (<HTMLInputElement>document.getElementById("category_" + this.editLineDataArr[i].id.toString())).value;
          this.editLineDataArr[i].location = (<HTMLInputElement>document.getElementById("location_" + this.editLineDataArr[i].id.toString())).value;
        }
        this.popupService.openPopup(["Insert Items", "Insert items into database successful."]);
      }
      else{
        this.popupService.openPopup(["Error", "An error occurred while sending the request."]);
      }           
    });
    
  }

  cancelAddAllNewItems(){
    this.newRows.length = 0;
    this.countNewRow = 0;
  }

}
