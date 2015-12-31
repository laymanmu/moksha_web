// moksha.js

// custom classes:
var tt = new TextTracker();
var db = new Database();

// input & output:
var textbox, versionMsg, message;

// settings:
var width, height, sort, reverseSort, blanks, tabs;
var origSettings = {};

$(document).ready(function() {
  textbox     = document.getElementById("textbox");
  versionMsg  = document.getElementById("versionNum");
  message     = document.getElementById("message");
  width       = document.getElementById("workspace_width");
  height      = document.getElementById("workspace_height");
  sort        = document.getElementById("sort");
  reverseSort = document.getElementById("reverseSort");
  blanks      = document.getElementById("blanks");
  tabs        = document.getElementById("tabs");
  csv         = document.getElementById("csv");
  upcase      = document.getElementById("upcase");
  downcase    = document.getElementById("downcase");

  // save original settings:
  origSettings.width  = textbox.offsetWidth;
  origSettings.height = textbox.offsetHeight;
  origSettings.tabs   = tabs.checked;

  // update the UI from db settings:
  db.open(function() {
    db.read(resetUI);
  });

  // EVENTS:

  blanks.onclick = function() {
    tt.createVersion(textbox.value);
    tt.removeBlankLines();
    textbox.value = tt.currentVersion();
    setMessages();
  };

  sort.onclick = function() {
    tt.createVersion(textbox.value);
    tt.sort();
    textbox.value = tt.currentVersion();
    setMessages();
  };

  reverseSort.onclick = function() {
    tt.createVersion(textbox.value);
    tt.reverseSort();
    textbox.value = tt.currentVersion();
    setMessages();
  };
  
  csv.onclick = function() {
    tt.createVersion(textbox.value);
    textbox.value = getText().split("\n").join(", ");
    tt.createVersion(textbox.value);
    setMessages();
  };

  upcase.onclick = function() {
    tt.createVersion(textbox.value);
    var selected = getSelected();
    if (selected.length > 0) {
      tt.replaceSelection(".*", selected.textbox.toUpperCase(), selected.start, selected.end);
    } else {
      tt.replace(".*", getText().toUpperCase());
    }
    textbox.value = tt.currentVersion();
    setMessages();
  };

  downcase.onclick = function() {
    tt.createVersion(textbox.value);
    var selected = getSelected();
    if (selected.length > 0) {
      tt.replaceSelection(".*", selected.textbox.toLowerCase(), selected.start, selected.end);
    } else {
      tt.replace(".*", getText().toLowerCase());
    }
    textbox.value = tt.currentVersion();
    setMessages();
  };

  $("#resetUI").click(function() {
    db.delete("width", setWidth);
    db.delete("height", setHeight);
    db.delete("tabs", setTabs);
  });

  $("#replaceButton").click(function() {
    var pattern     = document.getElementById("regex").value;
    var replacement = document.getElementById("replacement").value;
    var selected    = getSelected();
    if (textbox.value != tt.currentVersion()) {
      tt.createVersion(textbox.value);
    }
    if (selected.length > 0) {
      tt.replaceSelection(pattern, replacement, selected.start, selected.end);
    } else {
      tt.replace(pattern, replacement);
    }
    textbox.value = tt.currentVersion();
    setMessages();
  });

  $("#createButton").click(function() {
    tt.createVersion(getText());
    setMessages();
  });

  $("#previousButton").click(function() {
    tt.undo();
    textbox.value = tt.currentVersion();
    setMessages();
  });

  $("#nextButton").click(function() {
    tt.redo();
    textbox.value = tt.currentVersion();
    setMessages();
  });

  $("#log").click(function() {
    document.getElementById("log").innerHTML = "";
  });

  // tabs in text:
  textbox.onkeydown = function(e) {
    if ((e.keyCode==9 || e.wich==9) && tabs.checked) {
      e.preventDefault();
      var start = textbox.selectionStart;
      var end   = textbox.selectionEnd;
      var text  = textbox.value;
      textbox.value        = text.substring(0,start) +"\t"+ text.substring(end);
      textbox.selectionEnd = start+1;
    }
  }

  // db events:

  width.onchange = function() {
    textbox.style.width = width.value +"px";
    db.update("width", width.value);
  };

  height.onchange = function() {
    textbox.style.height = height.value +"px";
    db.update("height", height.value);
  };

  tabs.onchange = function() {
    db.update("tabs", tabs.checked);
  };

});

// HELPERS:

function log(text) {
  $("#log").append(text +"<br />");
}

function setMessages() {
  if (tt.errorMsg != "") {
    message.removeAttribute("class");
    message.setAttribute("class", "red");
    message.innerHTML = tt.errorMsg;
  } else {
    message.removeAttribute("class");
    message.setAttribute("class", "green");
    message.innerHTML = tt.infoMsg;
  }
  versionMsg.innerHTML = "current version: "+ (tt.currentVersionNum+1) +" of "+ tt.versions.length;
}

function getText() {
  return textbox.value;
}

function getSelected() {
  if ('selectionStart' in textbox) {
    var length = textbox.selectionEnd - textbox.selectionStart;
    return { start: textbox.selectionStart, 
             end: textbox.selectionEnd, 
             length: length,
             textbox: textbox.value.substr(textbox.selectionStart, length) };
  }
}

// UI SETTINGS HELPERS:

function resetUI(settings) {
  setWidth(settings);
  setHeight(settings);
  setTabs(settings);
}

function setWidth(settings) {
  if (settings && settings.width) {
    width.value         = settings.width;
    textbox.style.width = settings.width +"px";
  } else {
    width.value         = origSettings.width;
    textbox.style.width = origSettings.width +"px";
  }
}

function setHeight(settings) {
  if (settings && settings.height) {
    height.value         = settings.height;
    textbox.style.height = settings.height +"px";
  } else {
    height.value         = origSettings.height;
    textbox.style.height = origSettings.height +"px";
  }
}

function setTabs(settings) {
  if (settings && settings.tabs) {
    tabs.checked = settings.tabs;
  } else {
    tabs.checked = false;
  }
}
