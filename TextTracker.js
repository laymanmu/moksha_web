
try {
  log  = console.log;
  exports.TextTracker = TextTracker;
} catch(e) { 
}

function TextTracker() {

  this.currentVersionNum = 0;
  this.errorMsg          = "";
  this.infoMsg           = "";
  this.lastSave          = "";
  this.versions          = [];
  this.versions.push("");

  this.clearMessages = function() {
    this.infoMsg  = "";
    this.errorMsg = "";
  };

  this.currentVersion = function() {
    return this.versions[this.currentVersionNum];
  };

  this.createVersion = function(text) {
    this.clearMessages();
    if (this.currentVersion() == text) {
      this.errorMsg = "humbly refusing to create a version with no changes";
    } else {
      this.currentVersionNum += 1;
      this.versions[this.currentVersionNum] = text;
      this.infoMsg = "created a new version";
    }
  };

  this.undo = function() {
    this.clearMessages();
    if (this.currentVersionNum > 0) {
      this.currentVersionNum -= 1;
      this.infoMsg = "changed to previous version";
    } else {
      this.errorMsg = "already at the first version";
    }
  };

  this.redo = function() {
    this.clearMessages();
    if (this.currentVersionNum < this.versions.length-1) {
      this.currentVersionNum += 1;
      this.infoMsg = "changed to next version";
    } else {
      this.errorMsg = "already at the last version";
    }
  };

  this.removeBlankLines = function() {
    var result = [];
    var lines  = this.currentVersion().split("\n");
    for (var i=0; i<lines.length; i++) {
      if (lines[i]) {
        result.push(lines[i]);
      }
    }
    this.createVersion(result.join("\n"));
  };

  this.sort = function() {
    this.createVersion(this.currentVersion().split("\n").sort().join("\n"));
  };

  this.reverseSort = function() {
    this.createVersion(this.currentVersion().split("\n").sort().reverse().join("\n"));
  };

  this.replace = function(pattern, replacement) {
    this.replaceSelection(pattern, replacement, -1, -1);
  };

  /**********************************************************************************
   * replaces text including selectionStart up to but not including selectionEnd
   *
   * pattern: string (regex)
   * replacement: string
   * selectionStart: int (inclusive index)
   * selectionEnd: int (non-inclusive index)
   **********************************************************************************/
  this.replaceSelection = function(pattern, replacement, selectionStart, selectionEnd) {
    this.clearMessages();
    var beforeSelection = "";
    var afterSelection  = "";
    var usingSelection  = false;
    var lines           = [];
    var numMatches      = 0;
    var text            = this.currentVersion();
    var regex           = new RegExp(pattern, "g");

    // using a selection?
    if (selectionStart >= 0 && selectionEnd >= 0) {
      usingSelection = true;
      lines          = text.substring(selectionStart, selectionEnd).split("\n");
      if (selectionStart > 0) {
        beforeSelection = text.substring(0, selectionStart);
      }
      if (text.length > selectionEnd) {
        afterSelection = text.substring(selectionEnd);
      }
    } else {
      lines = text.split("\n");
    }

    // validate pattern:
    if (pattern == null || pattern == "") {
      this.errorMsg = "missing regex pattern";
    } else {
      var matches = [];
      for (var i=0; i<lines.length; i++) {
        matches = lines[i].match(regex);
        if (matches != null) {
          numMatches += matches.length;
        }
      }
    }

    // verify that at least one match was found:
    if (numMatches < 1 && this.errorMsg == "") {
      this.errorMsg = "no matches found from pattern: "+ pattern;
    }

    // do replacement:
    if (this.errorMsg == "") {
      var nextVersion = "";
      if (usingSelection) {
        nextVersion = beforeSelection;
      }

      // the browser escapes newlines so we must unescape them for a replacement of '\n' to work.
      // TODO: fix so a user can use '\\n' as a replacement and get '\n' (two characters).
      replacement = replacement.replace(/\\n/g,'\n');
      if (pattern == ".*") {
        nextVersion += replacement;
        numMatches  = 1;
      } else {
        var lineNum = 1;
        for (var i=0; i<lines.length; i++) {
          nextVersion += lines[i].replace(regex, replacement);
          if (lineNum < lines.length) {
            nextVersion += "\n";
          }
          lineNum += 1;
        }
      }
      if (usingSelection) {
        nextVersion += afterSelection;
      }
      this.createVersion(nextVersion);
      if (numMatches == 1) {
        this.infoMsg = "found 1 match";
      } else if (numMatches > 1) {
        this.infoMsg = "found "+ numMatches +" matches";
      }
    }
  };



    

}























