const udp = require("dgram");
const server = udp.createSocket("udp4");
const stdin = process.openStdin();

let connectedPort;
let name = "";
const chat = {};

stdin.once("data", (d) => {
  server.bind(d.toString().trim());
  server.on("listening", () => {
    console.log(`
    Alex Protasov 953504 ITIROD lab 1
    Server is listening at port ${server.address().port}.
    Type /join port to join chat(ex. /join 123).
    Type /leave to leave from chat.
    Press CTRL + C to exit from app.
    At first type your name:`);
  });
});

stdin.addListener("data", (d) => {
  const data = d.toString().trim();
  if (!name) {
    name = d.toString().trim();
  } else {
    switch (data) {
      case "/leave":
        if (connectedPort) server.send("LEAVE", connectedPort, "localhost");
        connectedPort = null;
        console.clear();
        break;
      case "/exit":
        server.close();
        stdin.end(() => {
          console.log("Write /exit again to close app or press CTRL + C");
        });
        break;
      default:
        if (/^\/join\s\d{1,5}$/gm.test(data)) {
          if (!connectedPort) {
            console.clear();
            connectedPort = data.split(" ")[1];
            console.log("Type something!");
          }
        } else if (connectedPort) {
          console.log(data);
          server.send(data, connectedPort, "localhost");
          chat[connectedPort] = [
            ...(chat[connectedPort] || []),
            {
              [name]: data,
            },
          ];
          console.clear();
          // console.log(chat[connectedPort]);
          chat[connectedPort].forEach((msg) => {
            console.log(`${Object.keys(msg)[0]}: ${Object.values(msg)[0]}`);
          });
        } else {
          console.log(`
          Type /join port to join chat(ex. /join 123).
          Press CTRL + C to exit from app.
          `)
        }

        break;
    }
  }
  if (data.includes("/exit")) {
    server.close();
    stdin.end(() => {
      console.log("Write /exit again to close app or press CTRL + C");
    });
  }
});

server.on("message", (msg, info) => {
  const data = msg.toString();

  if (data === "LEAVE") {
    connectedPort = null;
    console.clear();
    console.log("Disconnected from that side");
  } else {
    connectedPort = info.port;
    console.log(info, "22");
    chat[connectedPort] = [
      ...(chat[connectedPort] || []),
      {
        [`${info.address}:${info.port}`]: msg.toString(),
      },
    ];
  }
});
