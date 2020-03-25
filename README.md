## Running app

### Setup
```
nvm use
npm install
```

Add `.env` file to the project root with a following configs:
```
BROWSERSTACK_USERNAME=
BROWSERSTACK_ACCESS_KEY=
# below two are optional - not sure ever used on Automate (works without them)
GOOGLE_PLAY_USERNAME=
GOOGLE_PLAY_PASSWORD=
```

Need two processes started, server for rendering page with 3d models, and worker app that handles Browserstack logic:

1. Start the development server running on `http://<IP>:3001`  

```Shell
npm run server
```

2. Now in a separate console run the app (keep in mind to `nvm use` here as well). This runs logic to render and screenshot models.

```Shell
npm run android9
OR
npm run android10
```


