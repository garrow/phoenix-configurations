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
 * - Convert all movement messages to unicode box drawings.
 *
 * Known Bugs
 * - When resizing windows which define a minimum size (e.g. Spotify) when placed in a
 *   small size at a screen edge may push onto another monitor.
 */

Phoenix.set({
  daemon: false,
  openAtLogin: true
});

/**
 * Configure PhizeUp's behaviour here.
 */
const config = {
  movementAlertDuration: 0.5,
  sizeUpDefaults: false
};

const setupHandlers = useSizeUpDefaults => {
  const modKeys1 = ['ctrl', 'alt', 'cmd'];
  const modKeys2 = ['ctrl', 'alt', 'shift'];
  const screenKeys = ['ctrl', 'alt'];

  let quarters;

  if (useSizeUpDefaults) {
    quarters = [
      new Key('left', modKeys2, putWindow('topLeft')),
      new Key('up', modKeys2, putWindow('topRight')),
      new Key('down', modKeys2, putWindow('bottomLeft')),
      new Key('right', modKeys2, putWindow('bottomRight')),
    ]
  } else {
    // The alternative keymap allows using the RTFG keys as diagonal directional arrows.
    quarters = [
      new Key('r', modKeys1, putWindow('topLeft')),
      new Key('t', modKeys1, putWindow('topRight')),
      new Key('f', modKeys1, putWindow('bottomLeft')),
      new Key('g', modKeys1, putWindow('bottomRight')),
    ]
  }

  return {
    up: new Key('up', modKeys1, putWindow('up')),
    down: new Key('down', modKeys1, putWindow('down')),
    left: new Key('left', modKeys1, putWindow('left')),
    right: new Key('right', modKeys1, putWindow('right')),

    thirds: [
      new Key('keypad1', modKeys1, putWindow('leftThird')),
      new Key('keypad2', modKeys1, putWindow('centreThird')),
      new Key('keypad3', modKeys1, putWindow('rightThird')),

      new Key('keypad0', modKeys1, putWindow('left2Thirds')),
      new Key('keypad.', modKeys1, putWindow('right2Thirds')),
    ],

    // Allows pushing window thirds without a numpad
    thirds_small: [
      new Key(',', modKeys1, putWindow('leftThird')),
      new Key('.', modKeys1, putWindow('centreThird')),
      new Key('/', modKeys1, putWindow('rightThird')),

      new Key(';', modKeys1, putWindow('left2Thirds')),
      new Key("'", modKeys1, putWindow('right2Thirds')),
    ],

    sixths: [
      new Key('keypad7', modKeys1, putWindow('topLeftSix')),
      new Key('keypad8', modKeys1, putWindow('topCentreSix')),
      new Key('keypad9', modKeys1, putWindow('topRightSix')),
      new Key('keypad4', modKeys1, putWindow('botLeftSix')),
      new Key('keypad5', modKeys1, putWindow('botCentreSix')),
      new Key('keypad6', modKeys1, putWindow('botRightSix')),
    ],

    sixUp: [
      new Key('q', modKeys1, putWindow('sixUpTL')),
      new Key('a', modKeys1, putWindow('sixUpML')),
      new Key('z', modKeys1, putWindow('sixUpBL')),
      new Key('w', modKeys1, putWindow('sixUpTR')),
      new Key('s', modKeys1, putWindow('sixUpMR')),
      new Key('x', modKeys1, putWindow('sixUpBR')),
    ],
    sixUpDouble: [
      new Key('1', modKeys1, putWindow('sixUpTML')),
      new Key('2', modKeys1, putWindow('sixUpTMR')),
    ],

    quarters,

    centre: [
      new Key('c', modKeys1, putWindow('centre')),
      new Key('keypad-', modKeys1, putWindow('centre'))
    ],

    maximised: [
      new Key('m', modKeys1, maximise()),
      new Key('keypad+', modKeys1, maximise()),
    ],

    screenNext: new Key('right', screenKeys, putWindowScreen('next')),
    screenPrev: new Key('left', screenKeys, putWindowScreen('previous')),

    screenNext_: new Key(']', modKeys1, putWindowScreen('next')),
    screenPrev_: new Key('[', modKeys1, putWindowScreen('previous')),

    spaceNext: new Key('=', modKeys1, putWindowSpace('next')),
    spacePrev: new Key('-', modKeys1, putWindowSpace('previous')),

  };
};

const Movements = {
  up: "½\n┏━━━┓\n┃┅╳┅┃\n┡━━━┩\n│┈┈┈│\n└───┘\nUp",
  down: "½\n┌───┐\n│┈┈┈│\n┢━━━┪\n┃┅╳┅┃\n┗━━━┛\nDown",

  left: "½\n┏━┱─┐\n┃┅┃┈│\n┃╳┃┈│\n┃┅┃┈│\n┗━┹─┘\nLeft",
  right: "½\n┌─┲━┓\n│┈┃┅┃\n│┈┃╳┃\n│┈┃┅┃\n└─┺━┛\nRight",

  topLeft: "¼\n┏━┱─┐\n┃╳┃┈│\n┡━╃─┤\n│┈│┈│\n└─┴─┘\nUp Left",
  topRight: "¼\n┌─┲━┓\n│┈┃╳┃\n├─╄━┩\n│┈│┈│\n└─┴─┘\nUp Right",
  bottomLeft: "¼\n┌─┬─┐\n│┈│┈│\n┢━╅─┤\n┃╳┃┈│\n┗━┹─┘\nDown Left",
  bottomRight: "¼\n┌─┬─┐\n│┈│┈│\n├─╆━┪\n│┈┃╳┃\n└─┺━┛\nDown Right",

  maximised: "1\n┏━━━┓\n┃┈┈┈┃\n┃┈╳┈┃\n┃┈┈┈┃\n┗━━━┛\nFull Screen",
  centre: "¼\n┌───┐\n│┏━┓│\n│┃╳┃│\n│┗━┛│\n└───┘\nCentre",

  leftThird: "⅓\n┏━┱─┬─┐\n┃┅┃┈│┈│\n┃╳┃┈│┈│\n┃┅┃┈│┈│\n┗━┹─┴─┘\nLeft",
  centreThird: "⅓\n┌─┲━┱─┐\n│┈┃┅┃┈│\n│┈┃╳┃┈│\n│┈┃┅┃┈│\n└─┺━┹─┘\nCentre",
  rightThird: "⅓\n┌─┬─┲━┓\n│┈│┈┃┅┃\n│┈│┈┃╳┃\n│┈│┈┃┅┃\n└─┴─┺━┛\nRight",

  left2Thirds: "⅔\n┏━━━┱─┐\n┃┅┅┅┃┈│\n┃┅╳┅┃┈│\n┃┅┅┅┃┈│\n┗━━━┹─┘\nLeft ⅔",
  right2Thirds: "⅔\n┌─┲━━━┓\n│┈┃┅┅┅┃\n│┈┃┅╳┅┃\n│┈┃┅┅┅┃\n└─┺━━━┛\nRight ⅔",

  topLeftSix: "⅙\n┏━┱─┬─┐\n┃╳┃┈│┈│\n┡━╃─┼─┤\n│┈│┈│┈│\n└─┴─┴─┘\nUp Left",
  topCentreSix: "⅙\n┌─┲━┱─┐\n│┈┃╳┃┈│\n├─╄━╃─┤\n│┈│┈│┈│\n└─┴─┴─┘\nUp Centre",
  topRightSix: "⅙\n┌─┬─┲━┓\n│┈│┈┃╳┃\n├─┼─╄━┩\n│┈│┈│┈│\n└─┴─┴─┘\nUp Right",
  botLeftSix: "⅙\n┌─┬─┬─┐\n│┈│┈│┈│\n┢━╅─┼─┤\n┃╳┃┈│┈│\n┗━┹─┴─┘\nDown Left",
  botCentreSix: "⅙\n┌─┬─┬─┐\n│┈│┈│┈│\n├─╆━╅─┤\n│┈┃╳┃┈│\n└─┺━┹─┘\nDown Centre",
  botRightSix: "⅙\n┌─┬─┬─┐\n│┈│┈│┈│\n├─┼─╆━┪\n│┈│┈┃╳┃\n└─┴─┺━┛\nDown Right",

  // Safely fall back to a plain text label.
  get (direction) {
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
const withWindow = function withWindow(window, action) {
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
var putWindow = direction => () => {

  withWindow(Window.focused(), window => {
    const screenFrame = window.screen().flippedFrame();

    windowMovedAlert(Movements.get(direction), window);
    setInSubFrame(window, screenFrame, direction);
  });
};

/**
 * Place the window into a subframe inside the parent frame.
 *
 * @param window
 * @param parentFrame
 * @param direction
 */
var setInSubFrame = (window, parentFrame, direction) => {
  const newWindowFrame = getSubFrame(parentFrame, direction);
  window.setFrame(newWindowFrame);
};

/**
 * Build and return a handler to maximise the focused window.
 * @returns {Function}
 */
var maximise = () => () => {
  withWindow(Window.focused(), window => {
    windowMovedAlert(Movements.maximised, window);
    window.maximise();
  });
};

/**
 * Build a subframe within a parent frame.
 * This fn does the work of subdividing the rectangle. (screen)
 *
 * @param parentFrame
 * @param direction
 * @returns {*} / Rectangle
 */
var getSubFrame = (parentFrame, direction) => {
  const parentX = parentFrame.x;
  const parentY = parentFrame.y;
  const parentWidth = parentFrame.width;
  const parentHeight = parentFrame.height;

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
  const change = original => changeBy => {
    const offset = changeBy || 0;
    return original + offset;
  };

  const y = change(parentY);
  const x = change(parentX);

  const parentHalfWide = parentWidth / 2;
  const parentHalfHigh = parentHeight / 2;
  const parentThird = parentWidth / 3;
  const parentTwoThirds = parentThird * 2;
  const parentThirdHigh = parentHeight / 3;
  const parentTwoThirdsHigh = parentThirdHigh * 2;

  const subFrames = {
    left: {x: x(), y: y(), width: parentHalfWide, height: parentHeight},
    right: {x: x(parentHalfWide), y: y(), width: parentHalfWide, height: parentHeight},
    up: {x: x(), y: y(), width: parentWidth, height: parentHalfHigh},
    down: {x: x(), y: y(parentHalfHigh), width: parentWidth, height: parentHalfHigh},
    topLeft: {x: x(), y: y(), width: parentHalfWide, height: parentHalfHigh},
    bottomLeft: {x: x(), y: y(parentHalfHigh), width: parentHalfWide, height: parentHalfHigh},
    topRight: {x: x(parentHalfWide), y: y(), width: parentHalfWide, height: parentHalfHigh},
    bottomRight: {x: x(parentHalfWide), y: y(parentHalfHigh), width: parentHalfWide, height: parentHalfHigh},
    centre: {x: x(parentHalfWide / 2), y: y(parentHalfHigh / 2), width: parentHalfWide, height: parentHalfHigh},
    leftThird: {x: x(), y: y(), width: parentThird, height: parentHeight},
    centreThird: {x: x(parentThird), y: y(), width: parentThird, height: parentHeight},
    rightThird: {x: x(parentTwoThirds), y: y(), width: parentThird, height: parentHeight},
    left2Thirds: {x: x(), y: y(), width: parentTwoThirds, height: parentHeight},
    right2Thirds: {x: x(parentThird), y: y(), width: parentTwoThirds, height: parentHeight},
    topLeftSix: {x: x(), y: y(), width: parentThird, height: parentHalfHigh},
    topCentreSix: {x: x(parentThird), y: y(), width: parentThird, height: parentHalfHigh},
    topRightSix: {x: x(parentTwoThirds), y: y(), width: parentThird, height: parentHalfHigh},
    botLeftSix: {x: x(), y: y(parentHalfHigh), width: parentThird, height: parentHalfHigh},
    botCentreSix: {x: x(parentThird), y: y(parentHalfHigh), width: parentThird, height: parentHalfHigh},
    botRightSix: {x: x(parentTwoThirds), y: y(parentHalfHigh), width: parentThird, height: parentHalfHigh},
    sixUpTL: {x: x(), y: y(), width: parentHalfWide, height: parentThirdHigh},
    sixUpML: {x: x(), y: y(parentThirdHigh), width: parentHalfWide, height: parentThirdHigh},
    sixUpBL: {x: x(), y: y(parentTwoThirdsHigh), width: parentHalfWide, height: parentThirdHigh},
    sixUpTR: {x: x(parentHalfWide), y: y(), width: parentHalfWide, height: parentThirdHigh},
    sixUpMR: {x: x(parentHalfWide), y: y(parentThirdHigh), width: parentHalfWide, height: parentThirdHigh},
    sixUpBR: {x: x(parentHalfWide), y: y(parentTwoThirdsHigh), width: parentHalfWide, height: parentThirdHigh},
    sixUpTML: {x: x(), y: y(), width: parentHalfWide, height: parentTwoThirdsHigh},
    sixUpTMR: {x: x(parentHalfWide), y: y(), width: parentHalfWide, height: parentTwoThirdsHigh},

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
var alertModal = (message, onScreen) => {
  const alertModal = new Modal();
  alertModal.duration = config.movementAlertDuration;
  alertModal.text = message;
  alertModal.appearance = 'dark';

  const screenFrame = (onScreen || Screen.main()).frame();
  const alertFrame = alertModal.frame();

  alertModal.origin = {
    x: (screenFrame.x + (screenFrame.width * 0.5)) - (alertFrame.width * 0.5),
    y: (screenFrame.y + (screenFrame.height * 0.5)) - (alertFrame.height * 0.5)
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
var windowMovedAlert = (message, window) => {
  if (window) {
    alertModal(message, window.screen());
  }
};

var putWindowSpace = (destinationSpace) => {
  Phoenix.notify(`defined fn ${destinationSpace}`);

  return () => {

    console.log('Move window to space');
    Phoenix.notify(`SPAE_CHE_MAN ${destinationSpace}`);
    // alertModal(`SPAE_CHE_MAN ${destinationSpace}`)
    const window = Window.focused();

    const allSpaces = Space.all();

    if (allSpaces.length == 0) {
      alertModal("Unsupported or no spaces");
      return;
    }

    const windowSpaces = window.spaces();

    if (allSpaces.length == 0) {
      alertModal("Unsupported or no spaces");
      return;
    }

    const realSpace = space => space.isNormal() && !space.isFullScreen();
    const realSpaces = _.filter(allSpaces, realSpace);

    console.dir(realSpaces);

    _.map(allSpaces, (val, idx, col) => {

      console.log('removing window')
      val.removeWindows([window]);
    })

    // _.map(realSpaces, (val, idx, col) => {
    //
    //   val.addWindows([window]);
    // })

  }
};


var putWindowScreen = toScreen => () => {
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

  let op = "";

  op += `Current Screen ID: ${currentScreen.identifier()}\n`;

  const candidateOtherScreens = _.reject(screenList, s => s.identifier() == currentScreen.identifier());

  _.map(candidateOtherScreens, s => {
    op += `Screen ID: ${s.identifier()}\n${JSON.stringify(s.flippedFrame())}\n`;
  });

  const newScreenFrame = candidateOtherScreens[0].flippedFrame();

  op += `New Screen Frame ${JSON.stringify(newScreenFrame)}\n`;

  const newXOffset = newScreenFrame['x'];
  const newYOffset = newScreenFrame['y'];

  const oldFrame = window.frame();

  // debug(candidateOtherScreens);

  op += `Old Frame ${JSON.stringify(oldFrame)}\n`;

  // debug(newYOffset);

  const newFrame = {
    x: newXOffset,
    y: newYOffset,
    width: oldFrame.width,
    height: oldFrame.height
  };

  // debug(newFrame);

  op += `New Frame ${JSON.stringify(newFrame)}\n`;
  // windowMovedAlert(op);

  alertModal("MOVE SCREEN");
  window.setFrame(newFrame);

  // Phoenix.notify(JSON.stringify(screen.flippedFrame()));
  // Phoenix.notify(JSON.stringify(screen.identifier()));

};

function debug(o) {
  Phoenix.notify(JSON.stringify(o));
}

function debugscreen() {
  debug((Window.focused().screen().flippedFrame()))
}

// Phoenix requires us to keep a reference to the key handlers.
const keyHandlers = setupHandlers(config.sizeUpDefaults);

