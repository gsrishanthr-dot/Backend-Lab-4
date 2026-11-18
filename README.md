# Lab 4: Registration, login and JWT

Name: <your name> · Registration number: <your reg no> · Section: <your section>

**Live link:** <paste your Render / Railway / Cloud IDE URL here, or explain why it could not be deployed>

## How to run

```bash
cd lab-04
npm install
npm start
```

The server starts at `http://localhost:3000/`. The SQLite database `users.db` and the `user` table are created automatically on first run.

Environment variables: none required yet (`PORT` is optional, default 3000). The JWT secret is a constant in `app.js` for now and moves to `.env` in Lab 8.

## Endpoints

| Method | Path | Description | Status codes |
| --- | --- | --- | --- |
| POST | `/register/` | Create a user; password is hashed with bcrypt before saving | 201 created, 400 existing username / missing fields / short password |
| POST | `/login/` | Check username and password, return `{ jwt_token }` | 200 success, 400 unknown user / wrong password |

## Database

Table `user`: `id`, `username` (unique), `name`, `password` (bcrypt hash only, never plain text).

## Screenshots

![Register success](screenshots/register-success.png)
![Register existing user](screenshots/register-existing.png)
![Login success with token](screenshots/login-success.png)
![Login unknown user](screenshots/login-unknown-user.png)
![Login wrong password](screenshots/login-wrong-password.png)
![Hashed passwords in the database](screenshots/database-hashes.png)
![Token decoded at jwt.io](screenshots/jwt-io-decoded.png)

## Notes

- Problems faced and how I solved them: <write your own>
- Only the username is put in the JWT payload. The password is never stored or logged in plain text.
- All SQL uses parameterised queries (`?` placeholders).
