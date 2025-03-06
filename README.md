# 🐾 bd-bot 🐾

bd-bot is a Tamagotchi-style Discord game that homes your new English Bulldog alien pet.

Read more about building Discord Activities with the Embedded App SDK at [https://discord.com/developers/docs/activities/overview](https://discord.com/developers/docs/activities/overview).

### Run

#### Client
```
$ cd client/
$ npm run dev
```

#### Tunnel
```
cd client/
$ cloudflared tunnel --url http://localhost:5173
```

#### Server
```
$ cd server/
$ npm run dev
```

### Development

To quickly develop using a mock Discord API run:
```
$ cd client/
$ npm run local
```