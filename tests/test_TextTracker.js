#!/usr/local/bin/node
//
// To run: nodeunit <file>
//

var puts = console.log;
var lib  = require("../TextTracker.js");
var tt   = null;

exports.TextTracker = {

  setUp: function(callback) {
    tt = new lib.TextTracker();
    callback();
  },
  
  tearDown: function(callback) {
    tt = null;
    callback();
  },

  test_removeBlankLines: function(test) {
    var before = "one\n\ntwo\nthree\n\n\nfour\nfive\n";
    var after  = "one\ntwo\nthree\nfour\nfive";
    tt.createVersion(before);
    tt.removeBlankLines();
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.currentVersion(), after);
    test.done();
  },

  test_sort: function(test) {
    var before = "one\ntwo\nthree\nfour\nfive";
    var after  = "five\nfour\none\nthree\ntwo";
    tt.createVersion(before);
    tt.sort();
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.currentVersion(), after);
    test.done();
  },

  test_reverseSort: function(test) {
    var before = "one\ntwo\nthree\nfour\nfive";
    var after  = "two\nthree\none\nfour\nfive";
    tt.createVersion(before);
    tt.reverseSort();
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.currentVersion(), after);
    test.done();
  },

  test_currentVersionNum: function(test) {
    test.equal(tt.currentVersionNum, 0, 'should be 0');
    test.done();
  },

  test_clearMessages: function(test) {
    tt.infoMsg  = "some info";
    tt.errorMsg = "some errors";
    test.equal(tt.infoMsg, "some info");
    test.equal(tt.errorMsg, "some errors");

    tt.clearMessages();
    test.equal(tt.infoMsg, "", "should be empty");
    test.equal(tt.errorMsg, "", "should be empty");
    test.done();
  },

  test_currentVersion: function(test) {
    test.equal(tt.currentVersion(), "");
    test.done();
  },

  test_createVersion: function(test) {
    tt.createVersion("version1");
    test.equal(tt.currentVersion(), "version1");
    test.equal(tt.currentVersionNum, 1);
    test.equal(tt.infoMsg, "created a new version");
    test.equal(tt.errorMsg, "");

    tt.createVersion("a new version");
    test.equal(tt.currentVersion(), "a new version");
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.infoMsg, "created a new version");
    test.equal(tt.errorMsg, "");

    test.done();
  },

  test_create_same_version: function(test) {
    tt.createVersion("version1");
    test.equal(tt.currentVersion(), "version1");
    test.equal(tt.currentVersionNum, 1);

    tt.createVersion("version1");
    test.equal(tt.currentVersion(), "version1");
    test.equal(tt.currentVersionNum, 1);
    test.equal(tt.infoMsg, "");
    test.equal(tt.errorMsg, "humbly refusing to create a version with no changes");

    test.done();
  },

  test_undo: function(test) {
    for (var i=0; i<10; i++) {
      tt.createVersion("version1");
      test.equal(tt.currentVersion(), "version1");

      tt.createVersion("version2");
      test.equal(tt.currentVersion(), "version2");

      tt.undo();
      test.equal(tt.currentVersion(), "version1");
      test.equal(tt.currentVersionNum, 1);
      test.equal(tt.infoMsg, "changed to previous version");
      test.equal(tt.errorMsg, "");

      tt.undo();
      test.equal(tt.currentVersion(), "");
      test.equal(tt.currentVersionNum, 0);
      test.equal(tt.infoMsg, "changed to previous version");
      test.equal(tt.errorMsg, "");
    }
    test.done();
  },

  test_undo_too_far: function(test) {
    tt.createVersion("version1");
    tt.undo();
    test.equal(tt.currentVersionNum, 0);
    test.equal(tt.currentVersion(), "");
    test.equal(tt.infoMsg, "changed to previous version");
    test.equal(tt.errorMsg, "");

    tt.undo();
    test.equal(tt.currentVersionNum, 0);
    test.equal(tt.currentVersion(), "");
    test.equal(tt.infoMsg, "");
    test.equal(tt.errorMsg, "already at the first version");

    test.done();
  },

  test_redo: function(test) {
    tt.createVersion("version1");
    tt.createVersion("version2");
    for (var i=0; i<10; i++) {
      tt.undo();
      test.equal(tt.currentVersion(), "version1");
      test.equal(tt.currentVersionNum, 1);
      test.equal(tt.infoMsg, "changed to previous version");
      test.equal(tt.errorMsg, "");

      tt.redo();
      test.equal(tt.currentVersion(), "version2");
      test.equal(tt.currentVersionNum, 2);
      test.equal(tt.infoMsg, "changed to next version");
      test.equal(tt.errorMsg, "");
    }
    test.done();
  },

  test_redo_too_far: function(test) {
    tt.createVersion("version1");
    tt.undo();
    test.equal(tt.currentVersionNum, 0);
    test.equal(tt.currentVersion(), "");
    test.equal(tt.infoMsg, "changed to previous version");
    test.equal(tt.errorMsg, "");

    tt.redo();
    test.equal(tt.currentVersionNum, 1);
    test.equal(tt.currentVersion(), "version1");
    test.equal(tt.infoMsg, "changed to next version");
    test.equal(tt.errorMsg, "");

    tt.redo();
    test.equal(tt.currentVersionNum, 1);
    test.equal(tt.currentVersion(), "version1");
    test.equal(tt.infoMsg, "");
    test.equal(tt.errorMsg, "already at the last version");

    test.done();
  },

  test_replace_one_line: function(test) {
    tt.createVersion("version1");     //<- new version
    tt.replace("vers", "on");         //<- new version
    test.equal(tt.currentVersion(), "onion1");
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.infoMsg, "found 1 match");
    test.equal(tt.errorMsg, "");

    tt.createVersion("aabbaaccaa");   //<- new version
    tt.replace("aa", "AA");           //<- new version
    test.equal(tt.currentVersion(), "AAbbAAccAA");
    test.equal(tt.currentVersionNum, 4);
    test.equal(tt.infoMsg, "found 3 matches");
    test.equal(tt.errorMsg, "");

    test.done();
  },

  test_replace_multi_line: function(test) {
    tt.createVersion("car\nboat\nhat\nbook\ntea\nbike\n");   //<- new version
    tt.replace("a", "A");                                    //<- new version
    test.equal(tt.currentVersion(), "cAr\nboAt\nhAt\nbook\nteA\nbike\n");
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.infoMsg, "found 4 matches");
    test.equal(tt.errorMsg, "");
    test.done();
  },

  test_replaceSelection_one_line: function(test) {
    tt.createVersion("aabbaaccaaddaaee");     //<- new version
    tt.replaceSelection("aa", "AA", 3, 12);   //<- new version
    test.equal(tt.currentVersion(), "aabbAAccAAddaaee");
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.infoMsg, "found 2 matches");
    test.equal(tt.errorMsg, "");

    tt.createVersion("1234567890");          //<- new version
    tt.replaceSelection("\\d", "#", 2, 5);   //<- new version
    test.equal(tt.currentVersion(), "12###67890");
    test.equal(tt.currentVersionNum, 4);
    test.equal(tt.infoMsg, "found 3 matches");
    test.equal(tt.errorMsg, "");

    test.done();
  },

  test_replaceSelection_multi_line: function(test) {
    tt.createVersion("cat\ndog\nhat\nbat\ncar\nrat\npin\n");  //<- new version
    tt.replaceSelection("at", "AT", 3, 15);                   //<- new version
    test.equal(tt.currentVersion(), "cat\ndog\nhAT\nbAT\ncar\nrat\npin\n");
    test.equal(tt.currentVersionNum, 2);
    test.equal(tt.infoMsg, "found 2 matches");
    test.equal(tt.errorMsg, "");
    test.done();
  },

  test_replace_with_newline_replacement: function(test) {
    tt.createVersion("line\nline\nline");
    tt.replace("line", "line\n");
    test.equal(tt.currentVersion(), "line\n\nline\n\nline\n");
    test.done();
  },

  test_replace_with_wildcard: function(test) {
    tt.createVersion("line\nline\nline");
    tt.replace(".*", ":)");
    test.equal(tt.currentVersion(), ":)");
    test.done();
  },





};























