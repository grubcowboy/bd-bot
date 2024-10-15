import { DiscordSDK } from '@discord/embedded-app-sdk';

import './style.css'
import bdbotLogo from '/cartoon-dot.png'

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

setupDiscordSdk().then(() => {
  console.log("Discord is ready ☺︎");
});

async function setupDiscordSdk() {
  await discordSdk.ready();
}

document.querySelector('#app').innerHTML = `
  <div>
    <img src="${bdbotLogo}" class="logo" alt="bd bot" />
    <h1>Hello, World!</h1>
  </div>
`;