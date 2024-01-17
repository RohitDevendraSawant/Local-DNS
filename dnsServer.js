import dns from 'native-dns';

const server = dns.createServer();

// Handle DNS requests
server.on('request', (request, response) => {
  const question = request.question[0];
  const hostname = question.name;

  const ip = dnsRecords[hostname];

  if (ip) {
    const answer = dns.A({
      name: hostname,
      address: ip,
      ttl: 600,
    });
    response.answer.push(answer);
  }

  response.send();
});

// Start the DNS server
server.serve(53);

export default server;