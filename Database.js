
// C.R.U.D. for key/value pairs

//
// to delete the db, enter the following in the js console:
//    indexedDB.deleteDatabase("mokshadb");
//

function Database() {
  this.name      = "mokshadb";
  this.db        = null;
  this.supported = true;

  this.onerror = function(e) {
    console.log("MokshaDB error: "+ e.value);
  }; 

  this.open = function(callback) {
    var self      = this;  //<- for use inside of nested event handlers
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (indexedDB == null) {
      this.supported = false;
      console.log("Your browser does not support the database features for saving settings.");
      return;
    }
    var version   = 1;
    var request   = indexedDB.open(this.name, version);

    request.onerror         = this.onerror;
    request.onupgradeneeded = function(e) {
      self.db = e.target.result;
      e.target.transaction.onerror = self.onerror;
      if (self.db.objectStoreNames.contains(self.name)) {
        self.db.deleteObjectStore(self.name);
      }
      self.db.createObjectStore(self.name, {keyPath:"key"});
    };
    request.onsuccess = function(e) {
      self.db = e.target.result;
      if (callback) { callback(); }
    };  
  };

  // CRUD functions:

  this.create = function(key, value, callback) {
    if (!this.supported) { return; }
    var trans   = this.db.transaction([this.name], "readwrite");
    var store   = trans.objectStore(this.name);
    var request = store.put({"key":key, "value":value});
    request.onerror   = this.onerror;
    request.onsuccess = function(e) {
      if (callback) { callback(); }
    };
  };

  this.read = function(callback) {
    if (!this.supported) { return; }
    var trans   = this.db.transaction([this.name], "readwrite");
    var store   = trans.objectStore(this.name);
    var request = store.openCursor();
    var data    = {};
    request.onerror   = this.onerror;
    request.onsuccess = function(e) {
      var cursor = e.target.result;
      if (cursor) {
        var row = cursor.value;
        data[row.key] = row.value;
        cursor.continue();
      } else {
        if (callback) { callback(data); }
      }
    };
  };

  this.update = function(key, value, callback) {
    if (!this.supported) { return; }
    this.delete(key);
    this.create(key, value, callback);
  };

  this.delete = function(key, callback) {
    if (!this.supported) { return; }
    var trans   = this.db.transaction([this.name], "readwrite");
    var store   = trans.objectStore(this.name);
    var request = store.delete(key);
    request.onerror   = this.onerror;
    request.onsuccess = function(e) { 
      if (callback) { callback(); }
    };
  };

}























