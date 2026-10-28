let port;
let writer;

// target html elements
const connectBtn = document.querySelector('#connectBtn');
const sendBtn = document.querySelector('#sendBtn');
const output = document.querySelector('#output');

connectBtn.addEventListener('click', async function(){
    try {
        // Request the user to select the HUZZAH32 serial/COM port
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        writer = port.writable.getWriter();
        
        // when connected, we can disable connect button and interact with send button
        connectBtn.disabled = true;
        sendBtn.disabled = false;
        output.innerHTML += "<li>Connected to port!\n</li>";

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

    // we build our message 
    let message=`hello there\n`;

    // and we send the message through serial ----v
    await writer.write(new TextEncoder().encode(message));
});