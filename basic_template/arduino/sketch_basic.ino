
void setup() {
  Serial.begin(115200);
  while (!Serial) {
    delay(10); // Wait for serial port to open
  }


}

void loop() {
  // Read incoming data from the webpage
  if (Serial.available() > 0) {
    String incoming = Serial.readStringUntil('\n');
    Serial.println(incoming);
  }

  //Send periodic data to the webpage
  Serial.println("Hello from HUZZAH32!");
  delay(2000);
}
