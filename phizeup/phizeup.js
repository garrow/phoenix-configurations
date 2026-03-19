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
 * Known Bugs
 * - When resizing windows which define a minimum size (e.g. Spotify) when placed in a
 *   small size at a screen edge may push onto another monitor.
 */

'use strict';

/** Configure PhizeUp's behaviour here. */
const config = {
  movementAlertDuration: 0.5,
  sizeUpDefaults: false
};

const multiKey = (keys, modifiers, handler) => {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }
  return keys.map((key) => new Key(key, modifiers, handler));
};

const setupHandlers = (useSizeUpDefaults) => {
  const modKeys1   = ['ctrl', 'alt', 'cmd'],
      modKeys2   = ['ctrl', 'alt', 'shift'],
      screenKeys = ['ctrl', 'alt'];

  // Most common keybind, any of KEYS with modKeys1 to a new frame
  const movement = (keys, windowMovement) => {
    return multiKey(keys, modKeys1, putWindow(windowMovement));
  };

  let quarters;

  if (useSizeUpDefaults) {
    quarters = [
      multiKey('left',  modKeys2, putWindow('topLeft')),
      multiKey('up',    modKeys2, putWindow('topRight')),
      multiKey('down',  modKeys2, putWindow('bottomLeft')),
      multiKey('right', modKeys2, putWindow('bottomRight')),
    ];
  } else {
    // The alternative keymap allows using the RTFG keys as diagonal directional arrows.
    quarters = [
      movement('r', 'topLeft'),
      movement('t', 'topRight'),
      movement('f', 'bottomLeft'),
      movement('g', 'bottomRight'),
    ];
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
    centre: movement(['c', 'keypad-'], 'centre'),
    maximise: multiKey(['m', 'keypad+'], modKeys1, maximise()),
    screenNext: multiKey(['left', 'right'], screenKeys, putWindowScreen('next')),
    screenNextMax: multiKey(['left', 'right'], modKeys2, putWindowScreen('anything', true)),
  };
};

// SIDEBAR - arrow experiments
//
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

  topLeft:     '¼\n◼︎◻︎\n◻︎◻︎\n↖︎',
  topRight:    '¼\n◻︎◼︎\n◻︎◻︎\n↗︎',
  bottomLeft:  '¼\n◻︎◻︎\n◼︎◻︎\n↙︎',
  bottomRight: '¼\n◻︎◻︎\n◻︎◼︎\n↘︎',

  maximised:    '↖︎↑↗︎\n←◼︎→\n↙︎↓↘︎',
  centre:       '↘︎↓↙︎\n→⧈←\n↗︎↑↖︎',

  leftThird:    '⅓\n◼︎◻︎◻︎\n◼︎◻︎◻︎\n←',
  centreThird:  '⅓\n◻︎◼︎◻︎\n◻︎◼︎◻︎\n→←',
  rightThird:   '⅓\n◻︎◻︎◼︎\n◻︎◻︎◼︎\n→',

  left2Thirds:  '⅔\n◼︎◼︎◻︎\n◼︎◼︎◻︎\n←',
  right2Thirds: '⅔\n◻︎◼︎◼︎\n◻︎◼︎◼︎\n→',

  topLeftSix:   '⅙\n◼︎◻︎◻︎\n◻︎◻︎◻︎\n↖︎',
  topCentreSix: '⅙\n◻︎◼◻︎\n◻︎◻︎◻︎\n↑',
  topRightSix:  '⅙\n◻︎◻︎◼\n◻︎◻︎◻︎\n↗︎',
  botLeftSix:   '⅙\n◻︎◻︎◻︎\n◼◻︎◻︎\n↙︎',
  botCentreSix: '⅙\n◻︎◻︎◻︎\n◻︎◼◻︎\n↓',
  botRightSix:  '⅙\n◻︎◻︎◻︎\n◻︎◻︎◼\n↘︎',

  // Safely fall back to a plain text label.
  get(direction) {
    try {
      return this[direction].split(' ').join('\n').replace(/ +/g, '') || direction.toString();
    } catch {
      return String(direction);
    }
  },
};

// Sometimes a window doesn't actually exist.
const withWindow = (window, action) => {
  if (window) {
    action(window);
    return;
  }
  alertModal('Nothing to move');
};

const putWindow = (direction) => {
  return () => {
    withWindow(Window.focused(), (window) => {
      const screenFrame = window.screen().flippedFrame();
      windowMovedAlert(Movements.get(direction), window);
      setInSubFrame(window, screenFrame, direction);
    });
  };
};

const setInSubFrame = (window, parentFrame, direction) => {
  const newWindowFrame = getSubFrame(parentFrame, direction);
  window.setFrame(newWindowFrame);
};

/**
 * Parse a screen frame into offset helpers and dimensions.
 *
 * Multi-monitor setups offset each screen from a shared origin. Raw x,y from
 * a non-primary screen are non-zero, so all positioning must be relative to
 * the screen's own origin.
 *
 *      |---|
 *  |---|---|
 * screen 1: { x: 0, y: 0, width: 800, height: 600 }
 * screen 2: { x: 800, y: -600, width: 1600, height: 1200 }
 */
const frameMetrics = (parentFrame) => {
  const x = (offset) => Math.round(parentFrame.x + (offset || 0));
  const y = (offset) => Math.round(parentFrame.y + (offset || 0));
  return { x, y, width: parentFrame.width, height: parentFrame.height };
};

/**
 * Subdivide a parent frame (screen) into a named sub-region.
 */
const getSubFrame = (parentFrame, direction) => {
  const { x, y, width, height } = frameMetrics(parentFrame);

  const narrow     = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);
  const oneThird   = Math.round(width / 3);
  const twoThirds  = Math.round(oneThird * 2);

  const subFrames = {
    left:         { y: y(),            x: x(),          width: narrow,    height: height     },
    right:        { y: y(),            x: x(narrow),    width: narrow,    height: height     },
    up:           { y: y(),            x: x(),          width: width,     height: halfHeight },
    down:         { y: y(halfHeight),  x: x(),          width: width,     height: halfHeight },
    topLeft:      { y: y(),            x: x(),          width: narrow,    height: halfHeight },
    bottomLeft:   { y: y(halfHeight),  x: x(),          width: narrow,    height: halfHeight },
    topRight:     { y: y(),            x: x(narrow),    width: narrow,    height: halfHeight },
    bottomRight:  { y: y(halfHeight),  x: x(narrow),    width: narrow,    height: halfHeight },
    centre:       { y: y(halfHeight/2),x: x(narrow/2),  width: narrow,    height: halfHeight },
    leftThird:    { y: y(),            x: x(),          width: oneThird,  height: height     },
    centreThird:  { y: y(),            x: x(oneThird),  width: oneThird,  height: height     },
    rightThird:   { y: y(),            x: x(twoThirds), width: oneThird,  height: height     },
    left2Thirds:  { y: y(),            x: x(),          width: twoThirds, height: height     },
    right2Thirds: { y: y(),            x: x(oneThird),  width: twoThirds, height: height     },
    topLeftSix:   { y: y(),            x: x(),          width: oneThird,  height: halfHeight },
    topCentreSix: { y: y(),            x: x(oneThird),  width: oneThird,  height: halfHeight },
    topRightSix:  { y: y(),            x: x(twoThirds), width: oneThird,  height: halfHeight },
    botLeftSix:   { y: y(halfHeight),  x: x(),          width: oneThird,  height: halfHeight },
    botCentreSix: { y: y(halfHeight),  x: x(oneThird),  width: oneThird,  height: halfHeight },
    botRightSix:  { y: y(halfHeight),  x: x(twoThirds), width: oneThird,  height: halfHeight },
  };

  return subFrames[direction];
};

/**
 * Build a centered frame of a specific size within a parent frame.
 */
const getCenteredSpecificSize = (parentFrame, desiredSize) => {
  const { x, y, width, height } = frameMetrics(parentFrame);

  const offsetWidth  = Math.round(width / 2) - Math.round(desiredSize.width / 2);
  const offsetHeight = Math.round(height / 2) - Math.round(desiredSize.height / 2);

  return { y: y(offsetHeight), x: x(offsetWidth), width: desiredSize.width, height: desiredSize.height };
};

const maximise = () => {
  return () => {
    withWindow(Window.focused(), (window) => {
      windowMovedAlert(Movements.maximised, window);
      window.maximise();
    });
  };
};

/**
 * Render a Phoenix Modal with a string message centered on screen.
 */
const alertModal = (message, onScreen) => {
  const modal          = new Modal();
  modal.textAlignment  = 'right'; // 3.0.0 quirk: 'right' actually centers the text
  modal.duration       = config.movementAlertDuration;
  modal.text           = message;
  modal.weight         = 30;

  const screenFrame = (onScreen || Screen.main()).visibleFrame();
  const alertFrame  = modal.frame();

  modal.origin = {
    x: (screenFrame.x + (screenFrame.width * 0.5)) - (alertFrame.width * 0.5),
    y: (screenFrame.y + (screenFrame.height * 0.5)) - (alertFrame.height * 0.5)
  };

  modal.show();
  return modal;
};

const windowMovedAlert = (message, window) => {
  if (window) {
    alertModal(message, window.screen());
  }
};

/**
 * Move a window to a different screen.
 */
const putWindowScreen = (toScreen, keepMaximised = false) => {
  return () => {
    const window = Window.focused();

    if (window === undefined) {
      alertModal('No windows for current app');
      return;
    }

    const currentScreen = window.screen();
    const screenList = Screen.all();

    if (screenList.length < 2) {
      alertModal('No other screens');
      return;
    }

    const otherScreens = _.reject(screenList, (s) => s.identifier() === currentScreen.identifier());
    const newScreen = otherScreens[0];
    const newScreenFrame = newScreen.flippedVisibleFrame();
    const oldFrame = window.frame();
    const currentScreenFrame = currentScreen.visibleFrame();

    let newWidth, newHeight;

    // Maximised
    if (keepMaximised && currentScreenFrame.width === oldFrame.width && currentScreenFrame.height === oldFrame.height) {
      newWidth  = newScreenFrame.width;
      newHeight = newScreenFrame.height;
    } else {
    // Shrink to fit
      newWidth  = Math.min(oldFrame.width, newScreenFrame.width);
      newHeight = Math.min(oldFrame.height, newScreenFrame.height);
    }

    const newFrame = {
      y:      newScreenFrame.y,
      x:      newScreenFrame.x,
      width:  newWidth,
      height: newHeight
    };

    const direction = changeDirection(newFrame, oldFrame);
    const message = `📺\n${direction}`;

    alertModal(message, currentScreen);
    alertModal(message, newScreen);

    window.setFrame(newFrame);
  };
};

// Given two frames, compare the x,y points, return a compass direction of the change.
const changeDirection = (newFrame, oldFrame) => {
  const xdir = Math.sign(newFrame.x - oldFrame.x);
  const ydir = Math.sign(newFrame.y - oldFrame.y);
  const directions = [
    ['↖︎', '↑', '↗︎'],
    ['←',  'o', '→'],
    ['↙︎', '↓', '↘︎'],
  ];
  return directions[ydir + 1][xdir + 1];
};

const debug = (o) => {
  Phoenix.notify(JSON.stringify(o));
};

// Phoenix requires us to keep a reference to the key handlers.
const keyHandlers = setupHandlers(config.sizeUpDefaults);
