// moksha.js

var tt      = new TextTracker();
var db      = new Database();
var textbox = document.getElementById("textbox");

// save original settings:
var origSettings = {
  width:  document.getElementById("textbox").offsetWidth,
  height: document.getElementById("textbox").offsetHeight,
  tabs:   document.getElementById("tabs").checked,
};

// update the UI from db settings:
db.open(function() {
  db.read(resetUI);
});

// EVENTS:

document.getElementById("blanks").onclick = function() {
  tt.createVersion(textbox.value);
  tt.removeBlankLines();
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("sort").onclick = function() {
  tt.createVersion(textbox.value);
  tt.sort();
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("reverseSort").onclick = function() {
  tt.createVersion(textbox.value);
  tt.reverseSort();
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("csv").onclick = function() {
  tt.createVersion(textbox.value);
  textbox.value = textbox.value.split("\n").join(", ");
  tt.createVersion(textbox.value);
  setMessages();
};

document.getElementById("upcase").onclick = function() {
  tt.createVersion(textbox.value);
  var selected = getSelected();
  if (selected.length > 0) {
    tt.replaceSelection(".*", selected.textbox.toUpperCase(), selected.start, selected.end);
  } else {
    tt.replace(".*", textbox.value.toUpperCase());
  }
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("downcase").onclick = function() {
  tt.createVersion(textbox.value);
  var selected = getSelected();
  if (selected.length > 0) {
    tt.replaceSelection(".*", selected.textbox.toLowerCase(), selected.start, selected.end);
  } else {
    tt.replace(".*", textbox.value.toLowerCase());
  }
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("trim").onclick = function() {
  tt.createVersion(textbox.value);
  var replacement = [];
  var selected    = getSelected();
  if (selected.length > 0) {
    var lines = selected.textbox.split("\n");
    for (var i=0; i<lines.length; i++) {
      replacement.push(lines[i].trim());
    }
    tt.replaceSelection(".*", replacement.join("\n"), selected.start, selected.end);
  } else {
    var lines = textbox.value.split("\n");
    for (var i=0; i<lines.length; i++) {
      replacement.push(lines[i].trim());
    }
    tt.replace(".*", replacement.join("\n"));
  }
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("uniq").onclick = function() {
  tt.createVersion(textbox.value);
  var uniq  = [];
  var selected = getSelected();
  if (selected.length > 0) {
    var lines = selected.textbox.split("\n");
    for (var i=0; i<lines.length; i++) {
      if (uniq.indexOf(lines[i]) == -1) {
        uniq.push(lines[i]);
      }
    }
    tt.replaceSelection(".*", uniq.join("\n"), selected.start, selected.end);
  } else {
    var lines = textbox.value.split("\n");
    for (var i=0; i<lines.length; i++) {
      if (uniq.indexOf(lines[i]) == -1) {
        uniq.push(lines[i]);
      }
    }
    tt.replace(".*", uniq.join("\n"));
  }
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("count").onclick = function() {
  var count = 0;
  var selected = getSelected();
  if (selected.length > 0) {
    count = selected.textbox.split("\n").length;
  } else {
    count = textbox.value.split("\n").length;
  }
  showMessage("Count: "+ count); 
};

document.getElementById("resetUI").onclick = function() {
  db.delete("width", setWidth);
  db.delete("height", setHeight);
  db.delete("tabs", setTabs);
};

document.getElementById("replaceButton").onclick = function() {
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
};

document.getElementById("createButton").onclick = function() {
  tt.createVersion(textbox.value);
  setMessages();
};

document.getElementById("previousButton").onclick = function() {
  tt.undo();
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("nextButton").onclick = function() {
  tt.redo();
  textbox.value = tt.currentVersion();
  setMessages();
};

document.getElementById("log").onclick = function() {
  document.getElementById("log").innerHTML = "";
};

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

document.getElementById("workspace_width").onchange = function() {
  textbox.style.width = this.value +"px";
  db.update("width", this.value);
};

document.getElementById("workspace_height").onchange = function() {
  textbox.style.height = this.value +"px";
  db.update("height", this.value);
};

tabs.onchange = function() {
  db.update("tabs", tabs.checked);
};

// HELPERS:

function log(text) {
  document.getElementById("log").append(text +"<br />");
}

function setMessages() {
  var versionMsg  = document.getElementById("versionNum");
  var message     = document.getElementById("message");  
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

function showMessage(text) {
  var message = document.getElementById("message");  
  message.innerHTML = text;
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
  var width = document.getElementById("workspace_width");
  if (settings && settings.width) {
    width.value         = settings.width;
    textbox.style.width = settings.width +"px";
  } else {
    width.value         = origSettings.width;
    textbox.style.width = origSettings.width +"px";
  }
}

function setHeight(settings) {
  var height = document.getElementById("workspace_height");
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
