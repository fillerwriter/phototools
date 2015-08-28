"use strict";

var db = require("./database");

var dbUpdateManager = function() {

};

dbUpdateManager.process = function(args) {
  console.log("args", args);
  if (args.length === 0) {
    console.log(this.instructions());
  } else if (args[0] == "update") {
    this.update();
  }
};

dbUpdateManager.instructions = function() {
  return "HI";
};

dbUpdateManager.update = function() {
  db.one("SELECT EXISTS(SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'var');")
    .then(function(data) {
      if (data.exists === true) {
        console.log("It works");
      }
      process.exit(0);
    });

  db.query("CREATE TABLE photo ( data jsonb ) WITH ( OIDS=TRUE );")
    .then(function(data) {

    });

  //db.query("CREATE TABLE var (name  varchar(127), val jsonb)")
  //  .then(function(data) {
  //    console.log(data);
  //    return;
  //  });
};

module.exports = dbUpdateManager;