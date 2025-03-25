# Boston Liquor License Tracker API
This is a simple API server written in typescript, and using express.

# Running in development
1. Install depencencies
```bash
npm install
```
2. Run the dev server
```bash
npx ts-node src/index.ts
```
3. The server should be running on `http://localhost:3000`

# Testing production build
1. Build the project
```bash
docker build -t liquor-license-api .
```

2. Run the docker container
```bash
docker run --rm -it -p 8080:8080 liquor-license-api
```

3. The server should be running on `http://localhost:8080`
