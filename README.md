moksha_web
==========

A text editor in a browser that supports automatic versioning, regular expression replacements, and more.

It is intended for quick manipulations of text with no fear (just click "previous version" to backout a change).

All of the features below can work on all of the text or on a selection of the text.

Features:
* easy regular expression replacements
* sorting and reverse sorting
* removal of blank lines
* convert lines to CSV (comma separated values)
* convert to uppercase
* convert to lowercase
* remove blank space on beggining & end of lines
* convert to a unique list by removing duplicate lines (even if unsorted)
* toggle tabs in text (or use tabs to switch between ui components)
* customizable width and height
* ui settings are automatically saved in your browser db so you only have to set them once
* can be compiled to a single file for easy sharing and installation

![screenshot](https://cloud.githubusercontent.com/assets/14101417/13502620/873a3c78-e120-11e5-9de0-64ac55f7b9ee.png)

To use:
* open moksha.html in a modern browser.

To compile to a single file (requires Ruby):
* run:  `rake to_single_file`

To use as a google chrome extension app:
* open the Google Chrome browser or Chromium.
* type chrome://extensions into the address bar
* select the developer mod check box in the upper right of the page
* select "load unpacked extension..."
* navigate to the folder containing it
* select the containing folder and click the open button

