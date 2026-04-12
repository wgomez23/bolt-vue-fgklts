# natgmi.com

Marketing site for $NAT, built with Vue 3 + Vite and deployed on Heroku.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Deployment

- Production runs on Heroku
- `Procfile` and `app.json` define the Heroku runtime/buildpack setup
- Nginx serves the built `dist/` output via `config/nginx.conf.erb`
