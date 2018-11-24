const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');

var argv = require('minimist')(process.argv.slice(2));

// tested with docker run -it -p 8125:8125/udp dictcp/utils socat udp-recvfrom:8125,fork stdout
const filter_rules = [
  "test3",
  /^testing/,
  /^test2/
];

server.on('message', (msg, rinfo) => {
  // console.log(`server got: message with len ${msg.length} from ${rinfo.address}:${rinfo.port}`);
  
  var metric_array = msg.toString('ascii').split("\n");
  metric_array = metric_array.filter((x) => filter_rules.some((r) => (r instanceof RegExp) ? r.test(x) : x.startsWith(r)));

  if (metric_array.length > 0) {
    const message = Buffer.from(metric_array.join("\n") + "\n");

    // console.log(`server send: message with len ${message.length} to ${argv.chost}:${argv.cport}`);

    client.send(message, parseInt(argv.cport), argv.chost, (err) => {
      // client.close();
    });
  }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.bind(parseInt(argv.lport));
