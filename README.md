# phoenix-configurations
My custom configurations for the Phoenix macOS window Manager, ( https://github.com/kasper/phoenix )

# Configurations

### PhizeUp.js

A reimplementation of basic [SizeUp](http://www.irradiatedsoftware.com/sizeup/) functionality using the Phoenix window manager.

It's really useful for manually throwing the current window around using keyboard shortcuts.

It does not yet support spaces or screens, or have a nice
UI for customising keybinds.

Available window partitions are as follows.

```
+-----+-----+ +----------+ +-----+-----+ +--------------+
|     |     | |          | |     |     | |              |
|     |     | |    Up    | | TL  |  TR | |              |
|     |     | |          | |     |     | |  +--------+  |
|  L  |  R  | +----------+ +-----------+ |  | Center |  |
|     |     | |          | |     |     | |  +--------+  |
|     |     | |   Down   | | BL  |  BR | |              |
|     |     | |          | |     |     | |              |
+-----+-----+ +----------+ +-----+-----+ +--------------+
```

The default configuration uses SizeUp like keybinds,
but can be customised in code.

Additional Partitions
---------------------
These additional partitions are really only useful on larger screens.

These are bound to the number pad keys, as when I have a large screen attached, I have a full-sized keyboard.

Below the keybinds are listed as;

```
Partition
(Numpad Key)
```

```
+-----------------------------+
|         |         |         |
|   TL6   |   TC6   |   TR6   |
|   (7)   |   (8)   |   (9)   |
+-----------------------------+
|         |         |         |
|   BL6   |   BC6   |   BR6   |
|   (4)   |   (5)   |   (6)   |
+-----------------------------+
+-----------------------------+
|         |         |         |
|  Left   |  Centre |  Right  |
|  Third  |  Third  |  Third  |
|   (1)   |   (2)   |   (3)   |
|         |         |         |
+-----------------------------+
```

### Mousey.js

Display a cute message over the current position of the mouse cursor.

You may bind to a key by passing a reference to the `MousePointer.reveal` function.

e.g.
```
new Key('m', ['cmd','alt','ctrl'], MousePointer.reveal)

# Credits

Phoenix - https://github.com/kasper/phoenix
SizeUp - http://www.irradiatedsoftware.com/sizeup/
