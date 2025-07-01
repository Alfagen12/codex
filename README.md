# Codex Processing Platform

This repository contains a simple Node.js example of a processing platform. It
provides basic endpoints for registering users, storing payment details and
creating invoices.

## Running the server

```
node server.js
```

The server listens on port `3000` by default.

## Example API usage

Register a user:

```
POST /register
{"userId": "user1", "name": "Alice"}
```

Add payment details:

```
POST /users/user1/payment-details
{"account": "12345", "bank": "Demo Bank"}
```

Create an invoice:

```
POST /users/user1/invoices
{"amount": 1000, "description": "Service"}
```

List invoices:

```
GET /users/user1/invoices
```

Retrieve user info:

```
GET /users/user1
```
