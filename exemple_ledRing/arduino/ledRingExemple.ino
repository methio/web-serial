/*
  Hardware: huzzah32 + led ring

  led ring pins         huzzah32 pins
      VCC ------------------- 3.3V
      GND ------------------- GND
      DI -------------------  21

  hey, check course content to find 
  where the pin 21 is on the huzzah 😉
*/

// we load the library
#include <Adafruit_NeoPixel.h>
// then we create the ring object, from the Adafruit_NeoPixel class
Adafruit_NeoPixel ring(11, 21, NEO_GRB + NEO_KHZ800);

void setup() {
  // INITIALIZE NeoPixel ring object
  ring.begin();   
  ring.setBrightness(20);

  // initialize the serial communication
  Serial.begin(115200);
  while (!Serial) {
    delay(10); // Wait for serial port to open
  }
}

void loop() {
  // Read incoming data from the webpage
  if (Serial.available() > 0) {

    // we handle the message in a String variable
    String incoming = Serial.readStringUntil('\n');
    /* I know the message should be something like
        1:255-255-255\n
        |  |   |   L blue value
        |  |   L green value  
        |  L red value
        L index of the led
    */

    // we get the position (index) of the separator in the incoming string
    /*     X:XXX-XXX-XXX
            |   |   L posDash2 (index = 9)
            |   L posDash1 (index = 5)
            L posColon (index = 1)
    */    
    int posColon = incoming.indexOf(':');
    int posDash1 = incoming.indexOf('-', posColon + 1);
    int posDash2 = incoming.indexOf('-', posDash1 + 1);

    // Now we can extract the data and store it as integer values
    int address = incoming.substring(0, posColon).toInt();
    int red     = incoming.substring(posColon + 1, posDash1).toInt();
    int green   = incoming.substring(posDash1 + 1, posDash2).toInt();
    int blue    = incoming.substring(posDash2 + 1).toInt();

    // then we can use it on the ring
    ring.clear(); 
    uint32_t currentColor = ring.Color(red, green, blue);
    ring.setPixelColor(address, currentColor);
    ring.show(); 
  }

  delay(100);
}