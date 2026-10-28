// buttons pins are stored in an array
int buttonPins[] = {3, 4, 5, 6};
// we detect and store the size of the array
const int arraySize = sizeof(buttonPins) / sizeof(buttonPins[0]);
// an array with previous values to compare with the current ones
int previousValues[arraySize] = {0};

void setup() {
  // we loop through the array of pins to set the pin mode
  for(int i = 0; i < arraySize; i++){
    pinMode(buttonPins[i], INPUT);
  }

  Serial.begin(115200);
  while (!Serial) {
    delay(10); // Wait for serial port to open
  }
}

void loop() {

  String message = "";

  // we loop through all the buttons
  for(int index = 0; index < arraySize; index++){
    int currentButtonValue = digitalRead(buttonPins[index]);
    // for each button we check if the value changed
    if(currentButtonValue != previousValues[index]){
      // if value changed, we add it to the message
      message = message + "i" + buttonPins[index] + "-v" + currentButtonValue + ";";
    }
    // we update previous values array
    previousValues[index] = currentButtonValue;
  }

  // if something was added to the message, then send it
  if(message.length() > 0){
    message = message + "\n";
    Serial.println(message);
  }
  delay(300); // we read values 3 times per second.
}