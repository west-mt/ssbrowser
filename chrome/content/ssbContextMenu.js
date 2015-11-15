function ssbContextMenu(aXulMenu, aIsShift) {
  // Get contextual info.
  // Remember the node that was clicked.
  this.target = document.popupNode;

  // First, do checks for nodes that never have children.
  if (this.target.nodeType == Node.ELEMENT_NODE) {
	if (this.target instanceof HTMLInputElement ) {
      this.onTextInput = this.isTargetATextBox(this.target);
    }
    else if (this.target instanceof HTMLTextAreaElement) {
      this.onTextInput = true;
    }
  }
  this.isTextSelected = this.isTextSelection();
  this.isContentSelected = this.isContentSelection();


  // Initialize (disable/remove) menu items.
  this.showItem("context-undo", this.onTextInput);
  this.showItem("context-sep-undo", this.onTextInput);
  this.showItem("context-cut", this.onTextInput && this.isTextSelected);
  this.showItem("context-copy",
                this.isContentSelected || (this.onTextInput && this.isTextSelected));
  this.showItem("context-paste", this.onTextInput);
  this.showItem("context-delete", this.onTextInput && this.isTextSelected);
  this.showItem("context-sep-paste", this.onTextInput);
  this.showItem("context-selectall", !this.isContentSelected);

}

// Prototype for ssbContextMenu "class."
ssbContextMenu.prototype = {

  leaveDOMFullScreen: function() {
    document.mozCancelFullScreen();
  },

  ///////////////
  // Utilities //
  ///////////////

  // Show/hide one item (specified via name or the item element itself).
  showItem: function(aItemOrId, aShow) {
    var item = aItemOrId.constructor == String ?
      document.getElementById(aItemOrId) : aItemOrId;
    if (item){
      item.disabled = !aShow;
      //item.hidden = !aShow;
	}
  },


  // Get selected text. Only display the first 15 chars.
  isTextSelection: function() {
    // Get 16 characters, so that we can trim the selection if it's greater
    // than 15 chars
    var selectedText = getBrowserSelection(16);

	//dump("selectedText: "+selectedText+"\n");
    if (!selectedText)
      return false;
    else
	  return true;
  },

  // Returns true if anything is selected.
  isContentSelection: function() {
    //dump("ContentSlection: "+!document.commandDispatcher.focusedWindow.getSelection().isCollapsed+"\n");;
    return !document.commandDispatcher.focusedWindow.getSelection().isCollapsed;
  },

  isTargetATextBox: function(node) {
    if (node instanceof HTMLInputElement)
      return node.mozIsTextField(false);

    return (node instanceof HTMLTextAreaElement);
  },


};

function goSetCommandEnabled(aID, aEnabled)
{
  var node = document.getElementById(aID);

  dump(aID+": "+node+"\n");
  if (node) {
    if (aEnabled)
      node.removeAttribute("disabled");
    else
      node.setAttribute("disabled", "true");
  }
}

function goDoCommand(aCommand)
{
  try {
    var controller = top.document.commandDispatcher
                        .getControllerForCommand(aCommand);

	//dump(controller.isCommandEnabled(aCommand));

    if (controller && controller.isCommandEnabled(aCommand))
      controller.doCommand(aCommand);
  }
  catch (e) {
    dump("An error occurred executing the " +
         aCommand + " command: " + e + "\n");
  }
}

function goFullScreen(){
  dump(browser.mozRequestFullScreen+"\n");
  dump(browser.mozFullScreenEnabled+"\n");
  dump(browser.allowfullscreen+"\n");
  dump(document.mozRequestFullScreen+"\n");
  dump(document.mozFullScreenEnabled+"\n");
  dump(document.allowfullscreen+"\n");
  browser.mozRequestFullScreen();
}
