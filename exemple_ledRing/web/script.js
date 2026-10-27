let port;
let writer;

// target html elements
const connectBtn = document.querySelector('#connectBtn');
const sendBtn = document.querySelector('#sendBtn');

connectBtn.addEventListener('click', async function(){
    try {
        // Request the user to select the HUZZAH32 serial/COM port
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        writer = port.writable.getWriter();
        
        // when connected, we can disable connect button and interact with send button
        connectBtn.disabled = true;
        sendBtn.disabled = false;
        output.innerHTML += "Connected to port!\n";

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
                    console.log(value);
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

// we listent to the button and then try to send some data
sendBtn.addEventListener('click', async () => {
    if (!writer)return;

    // we decide what data to send (2 inputs below)
    let ledAdress = document.querySelector("#ledAdress");
    let ledColor = document.querySelector("#ledColor").value;
    // ledColor returns a hexadecimal color like #FFFFFF
    // so we translate it into RGB values
    const r = parseInt(ledColor.slice(1,3), 16);
    const g = parseInt(ledColor.slice(3,5), 16);
    const b = parseInt(ledColor.slice(5,7), 16);
    
    // we use that data to build our message 
    let message=`${ledAdress.value}:${r}-${g}-${b}\n`;

    // and we send the message through serial ----v
    await writer.write(new TextEncoder().encode(message));
});