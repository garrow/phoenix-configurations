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
 * However, my preferred keybinds reuse the same cmd,ctrl,alt, modifier keys and use the `rtfg`
 * letter keys on the keyboard, instead of changing modifier keys.
 *
 * Additional Partitions
 * ---------------------
 *
 * In addition I have added the following partitions, which are really only
 * useful on larger screens.
 *
 * These are bound to the number pad keys, as when I have a large screen attached, I have a full-sized keyboard.
 *
 * Below the keybinds are listed as;
 * Partition
 * (Numpad Key)
 *
 * +-----------------------------+
 * |         |         |         |
 * |   TL6   |   TC6   |   TR6   |
 * |   (7)   |   (8)   |   (9)   |
 * +-----------------------------+
 * |         |         |         |
 * |   BL6   |   BC6   |   BR6   |
 * |   (4)   |   (5)   |   (6)   |
 * +-----------------------------+
 *
 * +-----------------------------+
 * |         |         |         |
 * |  Left   |  Centre |  Right  |
 * |  Third  |  Third  |  Third  |
 * |   (1)   |   (2)   |   (3)   |
 * |         |         |         |
 * +-----------------------------+
 *
 * Credits
 * -------
 *
 * Original keybinds and the SizeUp name - SizeUp - http://www.irradiatedsoftware.com/sizeup/
 *
 * TODO List:
 * - Add spaces support.
 *
 * - Reuse the same modal object.
 * - Convert whole script to an object
 * - Simplify the configuration.
 *
 * Known Bugs
 * - When resizing windows which define a minimum size (e.g. Spotify) when placed in a
 *   small size at a screen edge may push onto another monitor.
 */

"use strict";

/**
 * Configure PhizeUp's behaviour here.
 */
var config = {
    movementAlertDuration: 0.5,
    sizeUpDefaults: false
};

var multiKey = (alternates, modifiers, handler) => {
    if (! Array.isArray(alternates)) {
        alternates = [alternates]
    } 
    return alternates.map((key) => { return new Key(key,  modifiers, handler) })
}

var setupHandlers = function(useSizeUpDefaults){
    var modKeys1 =   ['ctrl', 'alt', 'cmd'],
        modKeys2 =   ['ctrl', 'alt', 'shift'],
        screenKeys = ['ctrl', 'alt'];

    var quarters;

    if (useSizeUpDefaults) {
        quarters = [
            multiKey('left',  modKeys2, putWindow('topLeft')),
            multiKey('up',    modKeys2, putWindow('topRight')),
            multiKey('down',  modKeys2, putWindow('bottomLeft')),
            multiKey('right', modKeys2, putWindow('bottomRight')),
        ]
    } else {
        // The alternative keymap allows using the RTFG keys as diagonal directional arrows.
        quarters = [
            multiKey('r', modKeys1, putWindow('topLeft')),
            multiKey('t', modKeys1, putWindow('topRight')),
            multiKey('f', modKeys1, putWindow('bottomLeft')),
            multiKey('g', modKeys1, putWindow('bottomRight')),
        ]
    }

    return {
        up:          multiKey('up',    modKeys1, putWindow('up')),
        down:        multiKey('down',  modKeys1, putWindow('down')),
        left:        multiKey('left',  modKeys1, putWindow('left')),
        right:       multiKey('right', modKeys1, putWindow('right')),

        thirds: [
            multiKey([',', 'keypad1'],     modKeys1, putWindow('leftThird')),
            multiKey(['.', 'keypad2'],     modKeys1, putWindow('centreThird')),
            multiKey(['/', 'keypad3'],     modKeys1, putWindow('rightThird')),
            multiKey([';','keypad0'],      modKeys1, putWindow('left2Thirds')),
            multiKey([`'`, 'keypad.'],     modKeys1, putWindow('right2Thirds')),
        ],

        sixths: [
            multiKey(['u', 'keypad7'], modKeys1, putWindow('topLeftSix')),
            multiKey(['i', 'keypad8'], modKeys1, putWindow('topCentreSix')),
            multiKey(['o', 'keypad9'], modKeys1, putWindow('topRightSix')),
            multiKey(['j', 'keypad4'], modKeys1, putWindow('botLeftSix')),
            multiKey(['k', 'keypad5'], modKeys1, putWindow('botCentreSix')),
            multiKey(['l', 'keypad6'], modKeys1, putWindow('botRightSix')),
        ],

        quarters: quarters,

        centre: [
            multiKey(['c','keypad-'],       modKeys1, putWindow('centre')),
        ],

        maximised:[
            multiKey(['m',  'keypad+'], modKeys1, maximise()),
        ],

        screenNext: multiKey(['left', 'right'],  screenKeys, putWindowScreen('next')),
        screenPrev: multiKey(['left', 'right'],   modKeys2, putWindowScreen('anything', true)),
    };
};

// double ⇦⇧⇨⇩⇖⇗⇘⇙⤄
// chunky ⬆︎⬇︎⬊⬈⬉⬋➡︎⬅︎
// simple ↑↓←→↖︎↘︎↗︎↙︎

var Movements = {
    up:          `½\n◼︎◼︎\n◻︎◻︎\n↑`,
    down:        `½\n◻︎◻︎\n◼︎◼︎\n↓`,
    left:        `½\n◼︎◻︎\n◼︎◻︎\n←`,
    right:       `½\n◻︎◼︎\n◻︎◼︎\n→`,

    topLeft:     "¼\n◼︎◻︎\n◻︎◻︎\n↖︎",
    topRight:    "¼\n◻︎◼︎\n◻︎◻︎\n↗︎",
    bottomLeft:  "¼\n◻︎◻︎\n◼︎◻︎\n↙︎",
    bottomRight: "¼\n◻︎◻︎\n◻︎◼︎\n↘︎",

    maximised:    "↖︎↑↗︎\n←◼︎→\n↙︎↓↘︎",
    centre:       "↘︎↓↙︎\n→⧈←\n↗︎↑↖︎",

    leftThird:    "⅓\n◼︎◻︎◻︎\n◼︎◻︎◻︎\n←",
    centreThird:  "⅓\n◻︎◼︎◻︎\n◻︎◼︎◻︎\n→←", /// ⇹ ⤄
    rightThird:   "⅓\n◻︎◻︎◼︎\n◻︎◻︎◼︎\n→",

    left2Thirds:  "⅔\n◼︎◼︎◻︎\n◼︎◼︎◻︎\n←",
    right2Thirds: "⅔\n◻︎◼︎◼︎\n◻︎◼︎◼︎\n→",

    topLeftSix:   "⅙\n◼︎◻︎◻︎\n◻︎◻︎◻︎\n↖︎",
    topCentreSix: "⅙\n◻︎◼◻︎\n◻︎◻︎◻︎\n↑",
    topRightSix:  "⅙\n◻︎◻︎◼\n◻︎◻︎◻︎\n↗︎",
    botLeftSix:   "⅙\n◻︎◻︎◻︎\n◼◻︎◻︎\n↙︎",
    botCentreSix: "⅙\n◻︎◻︎◻︎\n◻︎◼◻︎\n↓",
    botRightSix:  "⅙\n◻︎◻︎◻︎\n◻︎◻︎◼\n↘︎",

    // Safely fall back to a plain text label.
    get: function(direction) {
        return this[direction] || direction.toString();
    },
};

/**
 * Sometimes a window doesn't actually exist.
 *
 * @param window
 * @param action
 * @returns {*}
 */
var withWindow = function withWindow(window, action) {
    if (window) {
        return action(window);
    }
    alertModal("Nothing to move");
};

/**
 * Build and return a handler which puts the focused (active) window into a position on that window's current screen.
 *
 * @param direction [Any Movement]
 * @returns {Function}
 */
var putWindow = function(direction){
    return function() {

        withWindow(Window.focused(), function(window) {
            var screenFrame = window.screen().flippedFrame();

            windowMovedAlert(Movements.get(direction), window);
            setInSubFrame(window, screenFrame, direction);
        });
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
    var _oldFrame = window.frame()
    var newWindowFrame = getSubFrame(parentFrame, direction);

    window.setFrame(newWindowFrame);
};

/**
 * Build and return a handler to maximise the focused window.
 * @returns {Function}
 */
var maximise = function() {
    return function () {
        withWindow(Window.focused(), function(window){
            windowMovedAlert(Movements.maximised, window);
            window.maximise();
        });
    };
};

/**
 * Build a subframe within a parent frame.
 * This fn does the work of subdividing the rectangle. (screen)
 *
 * @param parentFrame
 * @param direction
 * @returns {*} / Rectangle
 */
var getSubFrame = function(parentFrame, direction) {
    /**
    * When using multiple screens, the current screen may be offset from the Zero point screen,
    * using the raw x,y coords blindly will mess up the positions.
    * Instead, we offset the screen x,y, coords based on the original origin point of the screen.
    *      |---|
    *  |---|---|
    * In this case we have two screens side by side, but aligned on the physical bottom edge.
    * Remember that coords are origin 0,0 top left.
    * screen 1.  { x: 0, y: 0, width: 800, height: 600 }
    * screen 2.  { x: 800, y: -600, width: 1600, height: 1200 }
    **/
    var parentX      = parentFrame.x;
    var parentY      = parentFrame.y;
    var fullWide  = parentFrame.width;
    var fullHight = parentFrame.height;

    var change = function(original) {
        return function(changeBy) {
            var offset = changeBy || 0;
            return Math.round(original + offset);
        };
    };

    var y = change(parentY);
    var x = change(parentX);

    var narrow   = Math.round(fullWide / 2)
    var halfHight  = Math.round(fullHight / 2);
    var oneThird   = Math.round(fullWide / 3);
    var twoThirds  = Math.round(oneThird * 2);

    var subFrames = {
        left:         { y: y(),            x: x(),            width: narrow,   height: fullHight },
        right:        { y: y(),            x: x(narrow),      width: narrow,   height: fullHight },
        up:           { y: y(),            x: x(),            width: fullWide,   height: halfHight },
        down:         { y: y(halfHight),   x: x(),            width: fullWide,   height: halfHight },
        topLeft:      { y: y(),            x: x(),            width: narrow,   height: halfHight },
        bottomLeft:   { y: y(halfHight),   x: x(),            width: narrow,   height: halfHight },
        topRight:     { y: y(),            x: x(narrow),      width: narrow,   height: halfHight },
        bottomRight:  { y: y(halfHight),   x: x(narrow),      width: narrow,   height: halfHight },
        centre:       { y: y(halfHight/2), x: x(narrow/2),    width: narrow,   height: halfHight },
        leftThird:    { y: y(),            x: x(),            width: oneThird,   height: fullHight },
        centreThird:  { y: y(),            x: x(oneThird),    width: oneThird,   height: fullHight },
        rightThird:   { y: y(),            x: x(twoThirds),   width: oneThird,   height: fullHight },
        left2Thirds:  { y: y(),            x: x(),            width: twoThirds,  height: fullHight },
        right2Thirds: { y: y(),            x: x(oneThird),    width: twoThirds,  height: fullHight },
        topLeftSix:   { y: y(),            x: x(),            width: oneThird,   height: halfHight },
        topCentreSix: { y: y(),            x: x(oneThird),    width: oneThird,   height: halfHight },
        topRightSix:  { y: y(),            x: x(twoThirds),   width: oneThird,   height: halfHight },
        botLeftSix:   { y: y(halfHight),   x: x(),            width: oneThird,   height: halfHight },
        botCentreSix: { y: y(halfHight),   x: x(oneThird),    width: oneThird,   height: halfHight },
        botRightSix:  { y: y(halfHight),   x: x(twoThirds),   width: oneThird,   height: halfHight }
    };

    return subFrames[direction];
};
/**
 * Render a Phoenix Modal with a string message.
 *
 * TODO - Reuse the same Modal object to avoid artifacts when repeating actions and building lots of modals.
 *
 * @param message
 * @param onScreen
 * @returns {Modal}
 */
var alertModal = function (message, onScreen) {
    var alertModal         = new Modal();
    alertModal.duration    = config.movementAlertDuration;
    alertModal.text        = message;
    alertModal.weight      = 30;
    alertModal.appearance  = 'dark';

    var screenFrame     = (onScreen || Screen.main()).visibleFrame();
    var alertFrame      = alertModal.frame();

    alertModal.origin = {
        x:  (screenFrame.x + (screenFrame.width * 0.5)) - (alertFrame.width * 0.5),
        y:  (screenFrame.y + (screenFrame.height * 0.5)) - (alertFrame.height * 0.5)
    };

    alertModal.show();

    return alertModal;
};

/**
 * Places an alertModal on the screen the window was on, with the provided text message.
 *
 * @param message
 * @param window
 */
var windowMovedAlert = function(message, window) {
    if (window) {
        alertModal(message, window.screen());
    }
};


var putWindowScreen = function(toScreen, keepMaximised = false) {
    return function() {
        var window = Window.focused();

        if (window == undefined) {
            alertModal("NO Windows for current app");
            return;
        }

        var currentScreen = window.screen();
        var screenList = Screen.all();

        if (screenList.length < 2) {
            alertModal("NO SCREENS");
            return;
        }

        var candidateOtherScreens = _.reject(screenList, function(s){ return s.identifier() == currentScreen.identifier() });

        var newScreen = candidateOtherScreens[0];
        var newScreenFrame = newScreen.flippedVisibleFrame();

        var oldFrame = window.frame();

        var currentScreenFrame = currentScreen.visibleFrame()

        var newX = newScreenFrame['x'];
        var newY = newScreenFrame['y'];
        var newWidth;
        var newHeight;

        // Maximised
        if (keepMaximised && currentScreenFrame.width == oldFrame.width && currentScreenFrame.height == oldFrame.height) {
            newWidth = newScreenFrame.width
            newHeight = newScreenFrame.height
        } else {
        // Shrink to fit
            newWidth = Math.min(oldFrame.width, newScreenFrame.width)
            newHeight = Math.min(oldFrame.height, newScreenFrame.height)
        }

        var newFrame = {
            y:      newY,
            x:      newX,
            width:  newWidth,
            height: newHeight
        };

        var windowMovement = changeDirection(newFrame, oldFrame)
        var message = `📺\n${windowMovement}`

        alertModal(message, currentScreen)
        alertModal(message, newScreen)

        window.setFrame(newFrame);
    };
};

// Given two frames, compare the x,y points, return a compass direction of the change.
var changeDirection = function(newFrame, oldFrame) {
    var xdir = Math.sign(newFrame.x - oldFrame.x)
    var ydir = Math.sign(newFrame.y - oldFrame.y)
    var directions = [
        ['↖︎','↑','↗︎'],
        ['←','o','→'],
        ['↙︎','↓','↘︎'],
    ]
    var dir = directions[ydir+1][xdir+1]

    return dir
}



function debug(o){
    Phoenix.notify(JSON.stringify(o));
}

function debugscreen(){debug((Window.focused().screen().flippedFrame()))}


// Phoenix requires us to keep a reference to the key handlers.
var keyHandlers = setupHandlers(config.sizeUpDefaults);
