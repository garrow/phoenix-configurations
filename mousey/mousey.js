/**
 * Display a message over the current position of the mouse cursor.
 *
 * Bind to a key by passing a reference to the `MousePointer.reveal` function.
 *
 * e.g.
 * new Key('m', ['cmd','alt','ctrl'], MousePointer.reveal);
 */

"use strict";

class MousePointer {
    static reveal() {
        var invertedModalYAxisOffset = Window.focused().screen().frameInRectangle().height,
            mouse                    = Mouse.location(),
            modal                    = new Modal();

        modal.duration = 0.25;
        modal.message  = "🐭"; //Mouse Emoji

        var modalBounding = modal.frame();

        // Drawing a Modal renders from the bottom left, (Cocoa, screen coordinates space)
        // whereas Mouse position is given from Top Left of screen (Quartz / Global coordinates space)
        // So we offset Y axis of the Modal.origin to screen bottom, and
        // then place the center of our Modal over Mouse pointer position.
        modal.origin = {
            x: mouse.x - (modalBounding['width'] / 2),
            y: invertedModalYAxisOffset - mouse.y - (modalBounding['height'] / 2)
        };
        modal.show();

    }
}

var wheresTheCheese = new Key('m', ['cmd','alt','ctrl'], MousePointer.reveal);
