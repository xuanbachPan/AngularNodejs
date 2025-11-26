//request-app
//expense-entry-service.ts

 getExpenseEntries() : Observable<ExpenseEntryComponent[]> {
    return this.httpClient.get<ExpenseEntryComponent[]>(this.expenseRestUrl, this.httpOptions)
    .pipe(
       retry(3),
       catchError(this.httpErrorHandler.bind(this))
    );
 }

getExpenseEntries_2() : Observable<HttpEvent<ExpenseEntryComponent[]>> {
    getExpenseEntries_2() : Observable<HttpEvent<ExpenseEntryComponent[]>> {
    let req = new HttpRequest(
        'GET',
        this.expenseRestUrl, 
        this.httpOptions    
    );

    return this.httpClient.request<ExpenseEntryComponent[]>(req)
        .pipe(
            retry(3),
            catchError(this.httpErrorHandler.bind(this))
    );       
}

getExpenseEntries_3() : Observable<ResResultInterface> {
    return this.httpClient.request<ResResultInterface>(
        'GET',
        this.expenseRestUrl,
        { headers: new HttpHeaders({'Content-Type': 'application/json'}),
          observe: 'body', 
          responseType: 'json'
        }
    )
    .pipe(
        retry(3),
        catchError(this.httpErrorHandler.bind(this))
    ); 
}

updateExpenseEntry(data:ExpenseEntryComponent) :Observable<ExpenseEntryComponent>{
    return this.httpClient.put<ExpenseEntryComponent>("http://localhost:8000/api/expense/" + data.id.toString(),   //
       data, {observe: 'body', responseType: 'json', reportProgress: true})
    .pipe(
       retry(3),
       catchError(this.httpErrorHandler.bind(this))
    );
}


//expense-entry-list-component.ts
getExpenseItems() {
  this.restService.getExpenseEntries()
  .subscribe( data => this.expenseEntries = data );
}

getExpenseItems_2() {
  this.restService.getExpenseEntries_2()
  .subscribe((data: HttpEvent<ExpenseEntryComponent[]>) => {
    this.expenseEntries = (data as HttpResponse<ExpenseEntryComponent[]>).body as ExpenseEntryComponent[];
    
  })
}

getExpenseItems_3() {
  this.restService.getExpenseEntries_3()
  .subscribe(data => {
    console.log("getExpenseItems_3");
    console.log(data);
    if(data.sts_code == 200){
      this.expenseEntries = data.data;
      this.maxItemID = this.findMaxItemID(data.data);
    }
    else{
      //this.popupService.openPopup(["Error", "An error occurrs while the program request server."]);
    }
    
  });
}


//server.js - EXPENSE-REST-API
app.post("/api/expense/", (req, res, next) => {
   var errors=[]
   if (!req.body.item){
      errors.push("No item specified");
   }
   var data = {
      item : req.body.item,
      amount: req.body.amount,
      category: req.body.category,
      location : req.body.location,
      spendOn: req.body.spendOn,
      createdOn: req.body.createdOn,
   }
   var sql = 'INSERT INTO expense (item, amount, category, location, spendOn, createdOn) VALUES (?,?,?,?,?,?)'
   var params =[data.item, data.amount, data.category, data.location, data.spendOn, data.createdOn]
   db.run(sql, params, function (err, result) {
      if (err){
         res.json({"sts_code": 303, "sts_message": "Error", "detailed_message": err.message, "data": null});
         return;
      }
      data.id = this.lastID;
      res.json({"sts_code": 200, "sts_message": "OK", "detailed_message": "post successful","data":data});
   });
})

//SQLite
//change value of autocrement fields: (input: value, 'table_name')
//UPDATE sqlite_sequence SET seq = value WHERE name = 'table_name';