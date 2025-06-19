import { DiscordAPI, DiscordDummyAPI } from './discord.js';

import incubate from '../assets/incubate.png';
import egg from '../assets/bd-egg.png';
import poof from '../assets/poof-cloud.png';
import './style.css';

const env = import.meta.env.VITE_ENV;

const discord = env == "local" ? new DiscordDummyAPI() : new DiscordAPI();


const State = {
  EGG: 'egg',
  ADULT: 'adult',
  SPACE: 'space',
}


class BDBot {

  eggBodies = [egg];   // ['purple.png', 'red.png', 'green.png'];
  bodies = ['one.png', 'two.png', 'three.png'];

  constructor() {
    this.created = new Date();
    this.state = State.EGG;
    this.egg = this.eggBodies[0]; // TODO: rng
    this.body = this.bodies[0]; // TODO: rng
  }

}

discord.Init().then(() => {
  console.log("Discord SDK is authenticated ☺︎");

  // TODO: trying to create a div to hold voice channel and guild names for styling

  createBD();

  const body = document.querySelector('body');
  const locDiv = document.createElement('div');
  locDiv.setAttribute("id", "location-div");
  body.appendChild(locDiv);

  appendVoiceChannelName();
  appendGuildAvatar();
});


async function createBD() {
  const bd = new BDBot();


  document.querySelector('#app').innerHTML = `
  <img src="${bd.egg}" id="egg" alt="bd alien egg" />
  <div id="btns">
  <input type="image" id="incubate-btn" src="${incubate}" value="submit" />
  </div>
  `;

  document.querySelector('#incubate-btn').addEventListener("click", e => {
    document.querySelector('#egg').classList.add('shake');
  });

  document.querySelector('#egg').addEventListener("animationend", e => {
    //   document.querySelector('#egg').classList.remove('shake');
    //   console.log(document.querySelector('#egg').classList.length);
    // }, { once: false }
    document.querySelector('#egg').remove();
    const cloud = document.createElement('img');
    cloud.id = 'poof';
    cloud.alt = "poof cloud";
    cloud.src = poof;
    document.querySelector('#app').prepend(cloud);
  });

};



async function appendGuildAvatar() {
  const locationDiv = document.querySelector('#location-div');

  const currentGuild = await discord.Guild(discord.GuildID());

  // Append to the UI an img tag with the related information
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
  if (discord.ChannelID() != null && discord.GuildID() != null) {
    // Over RPC collect info about the channel
    const channel = await discord.Channel(discord.ChannelID());
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
