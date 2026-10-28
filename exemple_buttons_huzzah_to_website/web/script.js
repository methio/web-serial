let port;
let writer;

// target html elements
const output = document.querySelector('#output');
const connectBtn = document.querySelector('#connectBtn');

/*  we handle buttons state in an array of object. 
    each object is a controller element (button, joystick, etc)
    It has 3 keys :
     1- its name
     2- the pin where the button is attached on the huzzah
     3- the value the huzzah reads
*/
let controller = [
    {name: "button_left",   pin: 2, value:0},
    {name: "button_right",  pin: 3, value:0},
    {name: "button_up",     pin: 4, value:0},
    {name: "button_down",   pin: 5, value:0}
];

connectBtn.addEventListener('click', async function(){
    try {
        // Request the user to select the HUZZAH32 serial/COM port
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        writer = port.writable.getWriter();
        
        // when connected, we can disable connect button and interact with send button
        connectBtn.disabled = true;
        // sendBtn.disabled = false;
        output.innerHTML += `<li>Connected to port!\n</li>`;

        // Read incoming data from the HUZZAH32
        while (port.readable) {
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();

            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    // we receive the incoming data in the variable value
                    // (2 lines above). Now you can do stuff with the data
                    // you just received !
                    output.innerHTML += `<li>new message: ${value}</li>`;

                    // now we split the incoming message and store information in our array of objects
                    
                     // incoming : "i3-v1;i4-v1;" becomes ["i3-v1", "i4-v1", ""]
                    const parts = value.trim().split(";");
                    for (const part of parts) {
                        // make sure part isn't empty
                        if(part === "")continue;
                        
                        // a part look like this "i3-v1"
                        // i -> index
                        // v -> value
                        const [pinText, valueText] = part.split("-");

                        // now we have ["i3", "v1"]
                        // we need to remove i and v
                        // and then convert 3 and 1 from strings
                        // to integer numbers
                        const pin   = parseInt(pinText.slice(1));
                        const value = parseInt(valueText.slice(1));

                        // in the controller array, we search the right button
                        const button = controller.find((b) => b.pin === pin);

                        // if a button is found
                        if(button){
                            // we update its value
                            button.value = value;
                        }

                    }

                    console.log(controller);
                }

            // we keep this to handle the errors that might happen
            } catch (error) {
                console.error(error);
            } finally {
                reader.releaseLock();
            }
        }
    } catch (err) {
    console.error("Error opening serial port:", err);
    }
});