Admin authentication setup

This project uses a Mongo-backed AdminUser model with bcrypt-hashed passwords and JWT tokens.

Environment variables required:
- MONGO_URI - your MongoDB connection string
- JWT_SECRET - secret used to sign JWT tokens (strong random string)
- ADMIN_SIGNUP_SECRET (optional) - if set, required when calling /api/admin/signup to create admin users. If not set, signup is allowed only when there are no admin users in the DB (first-time setup).
- BCRYPT_ROUNDS (optional) - defaults to 12, increase for more security (at the cost of CPU/time).

Install dependencies in the server folder:

```bash
cd server
npm install
# or if using yarn
# yarn
```

Create the first admin (if you have ADMIN_SIGNUP_SECRET set):

```bash
curl -X POST http://localhost:4000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPassword","signupSecret":"<your signup secret>"}'
```

If no ADMIN_SIGNUP_SECRET is set, the above endpoint will only succeed if there are zero admin users in the DB (first-time initialization).

Login to receive a JWT token:

```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStrongPassword"}'
```

The response will contain { "token": "..." }. Send this token in requests to protected endpoints as an Authorization header:

Authorization: Bearer <token>

Notes:
- Keep JWT_SECRET and admin credentials secret.
- For highest security, run with HTTPS in production and set a strong JWT secret and higher bcrypt rounds.
