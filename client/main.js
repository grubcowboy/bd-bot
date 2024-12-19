// Import the SDK
import { DiscordSDK } from '@discord/embedded-app-sdk';

import bd from '../assets/bd-crinkle-tongue.png';
import egg from '../assets/bd-egg.png';
import incubate from '../assets/incubate.png'
import './style.css'

// Store the authenticated user's access_token
let auth;

// Instantiate the SDK
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);



setupDiscordSdk().then(() => {
  console.log("Discord SDK is authenticated ☺︎");
  // We can now make API calls within the scopes we requested in setupDiscordSDK()
  // Note: the access_token returned is a sensitive secret and should be treated as such

  // TODO: trying to create a div to hold voice channel and guild names for styling

  const app = document.querySelector('#app');
  const locDiv = document.createElement('div');
  locDiv.setAttribute("id", "location-div");
  app.appendChild(locDiv);

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
<img src="${egg}" id="egg" alt="bd alien egg" />
<div id="btns">
<input type="image" id="incubate-btn" src="${incubate}" value="submit" />
</div>
`;

// TODO: replace egg animation with placeholder bd image (v0) --> random bd (v1)

document.querySelector('#incubate-btn').addEventListener("click", e => {
  document.querySelector('#app').innerHTML = `
  <div>
  </div>
  `;
});


async function appendGuildAvatar() {
  const locationDiv = document.querySelector('#location-div');

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
    guildImg.setAttribute('width', '32px');
    guildImg.setAttribute('height', '32px');
    guildImg.setAttribute('style', 'border-radius: 50%;');
    guildImg.setAttribute("id", "guild");
    locationDiv.appendChild(guildImg);
  }
}

async function appendVoiceChannelName() {
  const locationDiv = document.querySelector('#location-div');

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
  const textTagString = `${activityChannelName}`;
  const textTag = document.createElement('p');
  textTag.textContent = textTagString;
  locationDiv.appendChild(textTag);
}
