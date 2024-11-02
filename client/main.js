// Import the SDK
import { DiscordSDK } from '@discord/embedded-app-sdk';

import bdbotLogo from '/cartoon-dot.png'
import './style.css'

// Store the authenticated user's access_token
let auth;

// Instantiate the SDK
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);


async function appendVoiceChannelName() {
  const app = document.querySelector('#app');

  let activityChannelName = 'Unknown';

  // Requesting the channel in GDMs (when guild id is null) requires
  // the dm_channels.read scope which requires Discord approval.
  if (discordSdk.channelId != null && discordSdk.guildId != null) {
    // Over RPC collect info about the channel
    const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
    if (channel.name != null) {
      activityChannelName = channel.name;
    }
  }

  // Update theUI with the name of the current voice channel
  const textTagString = `Activity Channel: "${activityChannelName}"`;
  const textTag = document.createElement('p');
  textTag.textContent = textTagString;
  app.appendChild(textTag);
}

async function appendGuildAvatar() {
  const app = document.querySelector('#app');

  // 1. From the HTTP API fetch a list of all the user's guilds
  const guilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      // NOTE: we're using the access_token provided by the "authenticate" command
      Authorization: `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  // 2. Find the current guild's info, including its "icon"
  const currentGuild = guilds.find((g) => g.id === discordSdk.guildId);

  // 3. Append to the UI an img tag with the related information
  if (currentGuild != null) {
    const guildImg = document.createElement('img');
    guildImg.setAttribute(
      'src',
      // More info on image formatting here: https://discord.com/developers/docs/reference#image-formatting
      `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`
    );
    guildImg.setAttribute('width', '128px');
    guildImg.setAttribute('height', '128px');
    guildImg.setAttribute('style', 'border-radius: 50%;');
    app.appendChild(guildImg);
  }
}

setupDiscordSdk().then(() => {
  console.log("Discord SDK is authenticated ☺︎");
  // We can now make API calls within the scopes we requested in setupDiscordSDK()
  // Note: the access_token returned is a sensitive secret and should be treated as such

  appendVoiceChannelName();
  appendGuildAvatar();
});


async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log("Discord SDK is ready ☺︎");

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds",
      "applications.commands"
    ],
  });

  // Retrieve an access_token form your activity's server
  // Note: We need to prefix our backend 'api/token' route with '/.proxy' to stay compliant with the CSP.
  // Read more about constructing a full URL and using external resources at
  // https://discord.com/developers/docs/activities/development-guides#construct-a-full-url
  const response = await fetch("/.proxy/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord clent (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }

}

document.querySelector('#app').innerHTML = `
  <div>
    <input id="spawn" type="button" value = "SPAWN" />
  </div>
`;

document.querySelector('#spawn').addEventListener("click", e => {
  document.querySelector('#app').innerHTML = `
  <div>
    <img src="${bdbotLogo}" class="logo" alt="bd bot" />
  </div>
`;

});