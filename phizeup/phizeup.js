/**
 * PhizeUp.js - A reimplementation of basic SizeUp functionality using the Phoenix window manager.
 *
 *  Window partitions are as follows.
 *
 * +-----+-----+ +----------+ +-----+-----+ +--------------+
 * |     |     | |          | |     |     | |              |
 * |     |     | |    Up    | | TL  |  TR | |              |
 * |     |     | |          | |     |     | |  +--------+  |
 * |  L  |  R  | +----------+ +-----------+ |  | Center |  |
 * |     |     | |          | |     |     | |  +--------+  |
 * |     |     | |   Down   | | BL  |  BR | |              |
 * |     |     | |          | |     |     | |              |
 * +-----+-----+ +----------+ +-----+-----+ +--------------+
 *
 * The default configuration uses SizeUp like keybinds.
 *
 * However, my preferred keybinds reuse the same cmd,ctrl,alt, modifier keys and use
 * letter keys on the keyboard, instead of changing modifier keys.
 *
 *
 * TODO List:
 * - Add spaces and screens support.
 *
 * - Reuse the same modal object.
 * - Convert whole script to an object
 * - Simplify the configuration.
 */

"use strict";

var config = {
    movementAlertDuration: 0.5,
};

var setupHandlers = function(){
    var modKeys1 =   ['ctrl', 'alt', 'cmd'],
        modKeys2 = ['ctrl', 'alt', 'shift'];


    return {
        up:          new Key('up',    modKeys1, putWindow('up')),
        down:        new Key('down',  modKeys1, putWindow('down')),
        left:        new Key('left',  modKeys1, putWindow('left')),
        right:       new Key('right', modKeys1, putWindow('right')),

        topLeft:     new Key('r',     modKeys2, putWindow('topLeft')),
        topRight:    new Key('t',     modKeys2, putWindow('topRight')),
        bottomLeft:  new Key('f',     modKeys2, putWindow('bottomLeft')),
        bottomRight: new Key('g',     modKeys2, putWindow('bottomRight')),

        // An alternative keymap allows using the RTFG keys as diagonal directional arrows.
        // topLeft:     new Key('r',     modKeys1, putWindow('topLeft')),
        // topRight:    new Key('t',     modKeys1, putWindow('topRight')),
        // bottomLeft:  new Key('f',     modKeys1, putWindow('bottomLeft')),
        // bottomRight: new Key('g',     modKeys1, putWindow('bottomRight')),

        center:      new Key('c',     modKeys1, putWindow('center')),
        maximised:   new Key('m',     modKeys1, maximise()),
    };
};

var Movements = {
    up:          "🔼\nUp",
    down:        "🔽\nDown",
    left:        "◀️\nLeft",
    right:       "▶️\nRight",
    topLeft:     "↖️\nTop Left",
    topRight:    "↗️\nTop Right",
    bottomLeft:  "↙️\nBottom Left",
    bottomRight: "↘️\nBottom Right",
    maximised:   "🆙\nMaximised",
    center:      "🔳\nCenter",
};

/**
 * Build and return a handler which puts the focused (active) window into a position on that window's current screen.
 *
 * @param direction [Any Movement]
 * @returns {Function}
 */
var putWindow = function(direction){
    return function() {
        var window = Window.focused();
        var screenFrame = window.screen().frameInRectangle();

        windowMovedAlert(Movements[direction]);
        setInSubFrame(window, screenFrame, direction);
    };
};

/**
 * Place the window into a subframe inside the parent frame.
 *
 * @param window
 * @param parentFrame
 * @param direction
 */
var setInSubFrame = function(window, parentFrame, direction) {
    var newWindowFrame = getSubFrame(parentFrame, direction);
    window.setFrame(newWindowFrame);
};

/**
 * Build and return a handler to maximise the focused window.
 * @returns {Function}
 */
var maximise = function() {
    return function () {
        windowMovedAlert(Movements.maximised);
        Window.focused().maximise();
    };
};

/**
 * Build a subframe within a parent frame.
 * This fn does the work of halving and quartering the rectangle. (screen)
 *
 * @param parentFrame
 * @param direction
 * @returns {*} / Rectangle
 */
var getSubFrame = function(parentFrame, direction) {
    var parentX      = parentFrame.x;
    var parentY      = parentFrame.y;
    var parentWidth  = parentFrame.width;
    var parentHeight = parentFrame.height;

    var parentHalfWide = parentWidth / 2;
    var parentHalfHigh = parentHeight / 2;

    var subFrames = {
        left:        { x: parentX,        y: parentY,        width: parentHalfWide, height: parentHeight   },
        right:       { x: parentHalfWide, y: parentY,        width: parentHalfWide, height: parentHeight   },
        up:          { x: parentX,        y: parentY,        width: parentWidth,    height: parentHalfHigh },
        down:        { x: parentX,        y: parentHalfHigh, width: parentWidth,    height: parentHalfHigh },

        topLeft:     { x: parentX,        y: parentY,        width: parentHalfWide, height: parentHalfHigh },
        bottomLeft:  { x: parentX,        y: parentHalfHigh, width: parentHalfWide, height: parentHalfHigh },
        topRight:    { x: parentHalfWide, y: parentY,        width: parentHalfWide, height: parentHalfHigh },
        bottomRight: { x: parentHalfWide, y: parentHalfHigh, width: parentHalfWide, height: parentHalfHigh },

        center:      { x: parentHalfWide/2, y: parentHalfHigh/2, width: parentHalfWide, height: parentHalfHigh  }
    };

    return subFrames[direction];
};
/**
 * Render a Phoenix Modal with a string message.
 *
 * TODO - Reuse the same Modal object to avoid artifacts when repeating actions and building lots of modals.
 *
 * @param message
 * @returns {Modal}
 */
var windowMovedAlert = function (message) {
    var alertModal      = new Modal();
    alertModal.duration = config.movementAlertDuration;
    alertModal.message  = message;

    var screenFrame     = Screen.main().frameInRectangle();
    var alertFrame      = alertModal.frame();

    alertModal.origin = {
        x: (screenFrame.width - alertFrame.width) * 0.5,
        y: (screenFrame.height - alertFrame.height) * 0.5
    };
    alertModal.show();

    return alertModal;
};

// Phoenix requires us to keep a reference to the key handlers.
var keyHandlers = setupHandlers();
