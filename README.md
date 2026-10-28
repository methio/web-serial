# web-serial

Examples of how to use the **Web Serial API** to make a web page communicate with a HUZZAH32. (Also works with your arduino uno, the red microcontroller from your kit).

## What is the Web Serial API?

The [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) lets a website **read from and write to a serial port**, meaning it can talk directly to a microcontroller plugged in over USB.

What you can do with it:

- send commands from a web page to a board (turn on an LED, drive a motor…);
- display data sent by sensors right in the browser.

> **Analogy:** the serial port is a pipe between the web page and the board. Each one talks at its own end, at the same speed (the *baud rate*), and the other one listens.

### Good to know

- Works only on **Chrome, Edge and Opera** (not Firefox or Safari).
- The user must **pick the port themselves** in a browser dialog (for security reasons).
- A port can only be opened by **one program at a time**: close the Arduino IDE serial monitor before connecting.
- The baud rate must be **the same** on the page (`port.open({ baudRate: 115200 })`) and on the Arduino (`Serial.begin(115200)`).

## What's in this repo

| Folder | Description |
|---|---|
| `basic_template/` | Basic template: connect to the serial port, send and receive text messages. |
| `exemple_ledRing/` | Control a ring of 12 RGB LEDs from a web page. |

---

## 1. Basic example (`basic_template`)

A starting point for your own projects: it shows how to **send** and **receive** messages between a web page and a board.

### Arduino side (HUZZAH32)

- reads the messages sent by the page (`Serial.readStringUntil('\n')`) and **echoes them back**;
- sends `Hello from HUZZAH32!` every 2 seconds;

### Web page side (`index.html` + `script.js`)

1. **Connect to HUZZAH32**: the browser asks you to choose a port, then opens it at 115200 baud.
2. **Send a message**: the button is disabled until the board is connected. One click sends the message `hello there`, which the Arduino echoes back.
3. All the messages received (the echo and the periodic `Hello from HUZZAH32!`) are displayed in the list on the page.

> The `\n` at the end of each message is essential: it tells the Arduino that the message is finished.

### Adapting it to your project

- change the content of the `message` variable in `script.js` to send something else;
- the loop that reads incoming data is where you process what the board sends: look for the place where `value` is received.

---

## 2. LED ring example (`exemple_ledRing`)

The web page lets you **choose an LED and its color**: the ring lights up accordingly.

### Wiring

| LED ring | HUZZAH32 |
|---|---|
| VCC | 3.3V |
| GND | GND |
| DI | pin 21 |

### The message format

The page sends a text message built like this:

```
address:red-green-blue\n
```

Example: `1:255-0-128\n` turns on LED number 1 with R = 255, G = 0, B = 128.

> **Analogy:** it works like a postal address. The number before the colon says *which LED* (the house), and the three numbers after it say *which color* (the parcel to deliver there). The final `\n` is like the full stop at the end of a sentence.

### Web page side (`index.html` + `script.js`)

- a number field to choose the LED address (the ring's LEDs are numbered from **0 to 11**);
- a color picker (`<input type="color">`), which returns a hexadecimal value such as `#FF8000`;
- the script converts this value into three numbers R, G, B, builds the message and sends it with the Web Serial API;
- the **Send color** button is disabled until the board is connected.

### Arduino side: decoding the message

The Arduino receives the message in a `String` with `Serial.readStringUntil('\n')`, then **cuts it up** at the separators:

```
 1 : 2 5 5 - 0 - 1 2 8
   |       |   |
   |       |   └ posDash2
   |       └ posDash1
   └ posColon
```

- `indexOf()` finds the position of each separator (`:` and then the two `-`);
- `substring()` extracts the piece of text between two positions;
- `toInt()` turns that text into a number.

This gives four variables (`address`, `red`, `green`, `blue`) that are used to light the LED:

```cpp
ring.clear();                                   // turns off all the LEDs
ring.setPixelColor(address, ring.Color(red, green, blue));
ring.show();                                    // applies the changes
```

> `setPixelColor` only prepares the color in memory: nothing is displayed until `ring.show()` is called.
> Since `ring.clear()` is called for every message, **only one LED is lit at a time**.

---

## Common problems

| Error | Likely cause |
|---|---|
| `Failed to open serial port` | Port already in use (serial monitor, another tab), "charge-only" cable, missing USB driver. |
| `Cannot pipe to a locked stream` | A reader/writer has already locked the stream: only request it once, and avoid double-clicking *Connect*. |
| `writer has been released` | `releaseLock()` was called too early: keep the writer for the whole session. |

>[!TIP]
> work in progress