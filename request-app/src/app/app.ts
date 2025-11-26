import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ExpenseEntryListComponent } from './expense-entry-list-component/expense-entry-list-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, CommonModule, 
    ExpenseEntryListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('request-app');
}
