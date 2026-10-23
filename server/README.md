# CyberSafe API deployment

The API allows requests from `http://localhost:5173` and from the frontend
origins configured through `CLIENT_URL` or comma-separated `CLIENT_URLS`.

For the current Vercel deployment, set this in the Render service's **Environment**:

```text
CLIENT_URL=https://cybersafe-nq1i-three.vercel.app
```

If you also need Vercel preview deployments, use `CLIENT_URLS` with the exact
origins, separated by commas. Origins include the scheme and host, with no path.
Save the Render environment change and redeploy the API. The Vercel project must
also have `VITE_API_URL` set to the Render API base URL ending in `/api`.

Copy `.env.example` to `.env` for local development. Do not commit `.env` files;
keep production secrets in the hosting provider's environment settings.
