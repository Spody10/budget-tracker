// create variable to hold db connection
let db;
// establish a connection to IndexedDB database
const request = indexedDB.open('money_transactions', 1);
// this event will emit if the database version changes
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table)
    db.createObjectStore('money', { autoIncrement: true });
  };

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store
    db = event.target.result;
    // check if app is online
    if (navigator.onLine) {
      // uploadTransaction();
    }
  };

  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

// This function will be executed if we attempt to submit and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['money'], 'readwrite');
    const moneyObjectStore = transaction.objectStore('money');
    moneyObjectStore.add(record);
}


function uploadMoney() {
    // open a transaction on your db
    const transaction = db.transaction(['money'], 'readwrite');
     // access your object store
    const moneyObjectStore = transaction.objectStore('money');
    // get all records from store and set to a variable
    const getAll = moneyObjectStore.getAll();
// upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['money'], 'readwrite');
            // access the object store
            const pizzaObjectStore = transaction.objectStore('money');
            // clear all items in your store
            pizzaObjectStore.clear();

            alert('Transactions have been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };

  }

window.addEventListener('online', uploadMoney);