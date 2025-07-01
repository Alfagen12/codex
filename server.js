const http = require('http');
const url = require('url');

const users = {};
const invoices = [];

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function collectRequestData(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (e) {
      callback(e);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (req.method === 'POST' && pathname === '/register') {
    collectRequestData(req, (err, data) => {
      if (err || !data.userId) {
        return send(res, 400, { error: 'Invalid user data' });
      }
      users[data.userId] = { name: data.name || '', paymentDetails: {} };
      send(res, 201, { message: 'User registered', user: users[data.userId] });
    });
    return;
  }

  const matchPayment = pathname.match(/^\/users\/([^/]+)\/payment-details$/);
  if (req.method === 'POST' && matchPayment) {
    const userId = matchPayment[1];
    if (!users[userId]) {
      return send(res, 404, { error: 'User not found' });
    }
    collectRequestData(req, (err, data) => {
      if (err) {
        return send(res, 400, { error: 'Invalid data' });
      }
      users[userId].paymentDetails = data;
      send(res, 200, { message: 'Payment details saved' });
    });
    return;
  }

  const matchInvoicePost = pathname.match(/^\/users\/([^/]+)\/invoices$/);
  if (req.method === 'POST' && matchInvoicePost) {
    const userId = matchInvoicePost[1];
    if (!users[userId]) {
      return send(res, 404, { error: 'User not found' });
    }
    collectRequestData(req, (err, data) => {
      if (err || typeof data.amount !== 'number') {
        return send(res, 400, { error: 'Invalid invoice data' });
      }
      const invoice = {
        id: invoices.length + 1,
        userId,
        amount: data.amount,
        description: data.description || '',
      };
      invoices.push(invoice);
      send(res, 201, { message: 'Invoice created', invoice });
    });
    return;
  }

  const matchInvoiceGet = pathname.match(/^\/users\/([^/]+)\/invoices$/);
  if (req.method === 'GET' && matchInvoiceGet) {
    const userId = matchInvoiceGet[1];
    if (!users[userId]) {
      return send(res, 404, { error: 'User not found' });
    }
    const userInvoices = invoices.filter(inv => inv.userId === userId);
    return send(res, 200, { invoices: userInvoices });
  }

  const matchUser = pathname.match(/^\/users\/([^/]+)$/);
  if (req.method === 'GET' && matchUser) {
    const userId = matchUser[1];
    const user = users[userId];
    if (!user) {
      return send(res, 404, { error: 'User not found' });
    }
    return send(res, 200, { userId, ...user });
  }

  send(res, 404, { error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
