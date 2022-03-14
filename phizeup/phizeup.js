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
const config = {
  movementAlertDuration: 0.5,
  sizeUpDefaults: false
};

const multiKey = (keys, modifiers, handler) => {
  if (! Array.isArray(keys)) {
    keys = [keys]
  }
  return keys.map((key) => { return new Key(key,  modifiers, handler) })
}



const setupHandlers = (useSizeUpDefaults) => {
  const modKeys1   = ['ctrl', 'alt', 'cmd'],
      modKeys2   = ['ctrl', 'alt', 'shift'],
      screenKeys = ['ctrl', 'alt'];

  // Most common keybind, any of KEYS with modKeys1 to a new frame
  const movement = (keys, windowMovement) => {
    return multiKey(keys,  modKeys1, putWindow(windowMovement))
  }


  let quarters;

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
      movement('r', 'topLeft'),
      movement('t', 'topRight'),
      movement('f', 'bottomLeft'),
      movement('g', 'bottomRight'),
    ]
  }

  return {
    quarters: quarters,
    halves: [
      movement('up',    'up'),
      movement('down',  'down'),
      movement('left',  'left'),
      movement('right', 'right'),
    ],
    thirds: [
      movement([',', 'keypad1'], 'leftThird'),
      movement(['.', 'keypad2'], 'centreThird'),
      movement(['/', 'keypad3'], 'rightThird'),
      movement([';', 'keypad0'], 'left2Thirds'),
      movement([`'`, 'keypad.'], 'right2Thirds'),
    ],
    sixths: [
      movement(['u', 'keypad7'], 'topLeftSix'),
      movement(['i', 'keypad8'], 'topCentreSix'),
      movement(['o', 'keypad9'], 'topRightSix'),
      movement(['j', 'keypad4'], 'botLeftSix'),
      movement(['k', 'keypad5'], 'botCentreSix'),
      movement(['l', 'keypad6'], 'botRightSix'),
    ],

    centre: movement(['c','keypad-'], 'centre'),
    maximise: multiKey(['m',  'keypad+'], modKeys1, maximise()),
    screenNext: multiKey(['left', 'right'], screenKeys, putWindowScreen('next')),
    screenNextMax: multiKey(['left', 'right'], modKeys2, putWindowScreen('anything', true)),
  };
};

// double ⇦⇧⇨⇩⇖⇗⇘⇙⤄
// chunky ⬆︎⬇︎⬊⬈⬉⬋➡︎⬅︎
// simple ↑↓←→↖︎↘︎↗︎↙︎
//
// `½
// ◼︎◼︎
// ◻︎◻︎
// ↑`
//
// `½
// ◼︎◼︎
// ◻︎◻︎
// ↑`


const Movements = {
  up:          `½ ◼︎◼︎ ◻︎◻︎ ↑`,
  down:        `½ ◻︎◻︎ ◼︎◼︎ ↓`,
  left:        `½ ◼︎◻︎ ◼︎◻︎ ←`,
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
  get(direction) {
    return this[direction].split(' ').join("\n").replace(/ +/g,'') || direction.toString();
  },
};

/**
 * Sometimes a window doesn't actually exist.
 *
 * @param window
 * @param action
 * @returns {*}
 */
const withWindow = (window, action) => {
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
const putWindow = (direction) => {
  return () => {

    withWindow(Window.focused(), (window) => {
      const screenFrame = window.screen().flippedFrame();

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
const setInSubFrame = (window, parentFrame, direction) => {
  const _oldFrame = window.frame()
  const newWindowFrame = getSubFrame(parentFrame, direction);

  // alertInFrame(changeDirection(newWindowFrame, _oldFrame), _oldFrame, window.screen());
  
  window.setFrame(newWindowFrame);
};

/**
 * Build and return a handler to maximise the focused window.
 * @returns {Function}
 */
const maximise = () => {
  return () => {
    withWindow(Window.focused(), (window) => {
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
const getSubFrame = (parentFrame, direction) => {
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
  const parentX   = parentFrame.x;
  const parentY   = parentFrame.y;
  const fullWide  = parentFrame.width;
  const fullHight = parentFrame.height;

  const change = (original) => {
    return (changeBy) => {
      const offset = changeBy || 0;
      return Math.round(original + offset);
    };
  };

  const y = change(parentY);
  const x = change(parentX);

  const narrow     = Math.round(fullWide / 2)
  const halfHight  = Math.round(fullHight / 2);
  const oneThird   = Math.round(fullWide / 3);
  const twoThirds  = Math.round(oneThird * 2);

  const subFrames = {
    left:         { y: y(),            x: x(),          width: narrow,    height: fullHight },
    right:        { y: y(),            x: x(narrow),    width: narrow,    height: fullHight },
    up:           { y: y(),            x: x(),          width: fullWide,  height: halfHight },
    down:         { y: y(halfHight),   x: x(),          width: fullWide,  height: halfHight },
    topLeft:      { y: y(),            x: x(),          width: narrow,    height: halfHight },
    bottomLeft:   { y: y(halfHight),   x: x(),          width: narrow,    height: halfHight },
    topRight:     { y: y(),            x: x(narrow),    width: narrow,    height: halfHight },
    bottomRight:  { y: y(halfHight),   x: x(narrow),    width: narrow,    height: halfHight },
    centre:       { y: y(halfHight/2), x: x(narrow/2),  width: narrow,    height: halfHight },
    leftThird:    { y: y(),            x: x(),          width: oneThird,  height: fullHight },
    centreThird:  { y: y(),            x: x(oneThird),  width: oneThird,  height: fullHight },
    rightThird:   { y: y(),            x: x(twoThirds), width: oneThird,  height: fullHight },
    left2Thirds:  { y: y(),            x: x(),          width: twoThirds, height: fullHight },
    right2Thirds: { y: y(),            x: x(oneThird),  width: twoThirds, height: fullHight },
    topLeftSix:   { y: y(),            x: x(),          width: oneThird,  height: halfHight },
    topCentreSix: { y: y(),            x: x(oneThird),  width: oneThird,  height: halfHight },
    topRightSix:  { y: y(),            x: x(twoThirds), width: oneThird,  height: halfHight },
    botLeftSix:   { y: y(halfHight),   x: x(),          width: oneThird,  height: halfHight },
    botCentreSix: { y: y(halfHight),   x: x(oneThird),  width: oneThird,  height: halfHight },
    botRightSix:  { y: y(halfHight),   x: x(twoThirds), width: oneThird,  height: halfHight }
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
const alertModal = (message, onScreen) => {
  const alertModal       = new Modal();
  alertModal.textAlignment = 'right' // 3.0.0 ? 'right' makes the text centered?
  alertModal.duration    = config.movementAlertDuration;
  alertModal.text        = message;
  alertModal.weight      = 30;
  

  const screenFrame     = (onScreen || Screen.main()).visibleFrame();
  const alertFrame      = alertModal.frame();

  alertModal.origin = {
    x:  (screenFrame.x + (screenFrame.width * 0.5)) - (alertFrame.width * 0.5),
    y:  (screenFrame.y + (screenFrame.height * 0.5)) - (alertFrame.height * 0.5)
  };

  alertModal.show();

  return alertModal;
};


const alertInFrame = (message, inFrame, onScreen) => {
  const alertInFrame       = new Modal();
  alertInFrame.textAlignment = 'right' // 3.0.0 ? 'right' makes the text centered?
  alertInFrame.duration    = config.movementAlertDuration;
  alertInFrame.text        = message;
  alertInFrame.weight      = 30;
  

  const screenFrame     = (onScreen || Screen.main()).visibleFrame();
  const alertFrame      = alertInFrame.frame();

  alertInFrame.origin = {
    x:  (inFrame.x + (inFrame.width * 0.5)) - (alertFrame.width * 0.25),
    y:  (inFrame.y + (inFrame.height * 0.5)) - (alertFrame.height * 0.25)
  };

  alertInFrame.show();

  return alertInFrame;
}



/**
 * Places an alertModal on the screen the window was on, with the provided text message.
 *
 * @param message
 * @param window
 */
const windowMovedAlert = (message, window) => {
  if (window) {
    alertModal(message, window.screen());
  }
};


/**
 * Puts a window to a new screen.
 *
 * @param toScreen
 * @param keepMaximised
 */
const putWindowScreen = (toScreen, keepMaximised = false) => {
  return () => {
    const window = Window.focused();

    if (window == undefined) {
      alertModal("NO Windows for current app");
      return;
    }

    const currentScreen = window.screen();
    const screenList = Screen.all();

    if (screenList.length < 2) {
      alertModal("NO SCREENS");
      return;
    }

    const candidateOtherScreens = _.reject(screenList, (s) => ( s.identifier() == currentScreen.identifier() ));

    const newScreen = candidateOtherScreens[0];
    const newScreenFrame = newScreen.flippedVisibleFrame();

    const oldFrame = window.frame();

    const currentScreenFrame = currentScreen.visibleFrame()

    const newX = newScreenFrame['x'];
    const newY = newScreenFrame['y'];
    let newWidth;
    let newHeight;

    // Maximised
    if (keepMaximised && currentScreenFrame.width == oldFrame.width && currentScreenFrame.height == oldFrame.height) {
      newWidth = newScreenFrame.width
      newHeight = newScreenFrame.height
    } else {
    // Shrink to fit
      newWidth = Math.min(oldFrame.width, newScreenFrame.width)
      newHeight = Math.min(oldFrame.height, newScreenFrame.height)
    }

    const newFrame = {
      y:      newY,
      x:      newX,
      width:  newWidth,
      height: newHeight
    };

    const windowMovement = changeDirection(newFrame, oldFrame)
    const message = `📺\n${windowMovement}`

    alertModal(message, currentScreen)
    alertModal(message, newScreen)

    window.setFrame(newFrame);
  };
};

// Given two frames, compare the x,y points, return a compass direction of the change.
const changeDirection = (newFrame, oldFrame) => {
  const xdir = Math.sign(newFrame.x - oldFrame.x)
  const ydir = Math.sign(newFrame.y - oldFrame.y)
  const directions = [
    ['↖︎','↑','↗︎'],
    ['←','o','→'],
    ['↙︎','↓','↘︎'],
  ]
  const dir = directions[ydir+1][xdir+1]

  return dir
}



const debug = (o) => {
  Phoenix.notify(JSON.stringify(o));
}

const debugscreen = () => {debug((Window.focused().screen().flippedFrame()))}


// Phoenix requires us to keep a reference to the key handlers.
const keyHandlers = setupHandlers(config.sizeUpDefaults);
