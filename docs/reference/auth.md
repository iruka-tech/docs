# Auth

Use an API key on protected requests:

```http
X-API-Key: iruka_...
```

## Get an API key

Sign in on `iruka.tech`, open the Iruka console, and generate an API key there.

Send requests to `https://api.hiruka.tech`.

## Fetch the current profile

```http
GET /api/v1/auth/me
```

This works with an API key.

## Log out

```http
POST /api/v1/auth/logout
```

## What to read next

- Read **API Reference** for protected endpoint behavior
- Read **Webapp Integration** if you are building a frontend on top of Iruka
