# API Proxy (Development)

The 404 on `Auth/login` happens because the Angular dev server (port 4200) does not host your API.

## Fix

1. **Run your backend** on the port set in `proxy.conf.json` (default: `http://localhost:5000`).

2. **Start Angular with proxy:**
   ```bash
   ng serve
   ```
   Requests to `http://localhost:4200/Api/...` are forwarded to `http://localhost:5000/Api/...`.

3. **If your backend uses another port**, edit `proxy.conf.json`:
   ```json
   {
     "/Api": {
       "target": "http://localhost:YOUR_PORT",
       "secure": false,
       "changeOrigin": true
     }
   }
   ```

4. **If you don't use a proxy** (e.g. backend on same machine, different port), you can set the full URL in `src/environments/environment.ts`:
   ```ts
   apiBaseUrl: 'http://localhost:5000/Api/V1/CarRentalManagament',
   ```
   Then CORS must be enabled on the backend for `http://localhost:4200`.

## Backend login endpoint

The frontend calls **POST** `Auth/login`. Your backend must expose:

- **URL:** `POST /Api/V1/CarRentalManagament/Auth/login`
- **Body:** `{ "username": string, "password": string }`
- **Response:** `{ "data": { "token": "JWT..." }, "succeeded": true, ... }`

If your login path is different, change `loginEndpoint` in `src/app/core/services/auth.service.ts`.
