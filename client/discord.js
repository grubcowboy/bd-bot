import { DiscordSDK } from '@discord/embedded-app-sdk';

// NOTE: This is not ideal at all, but the time spent adding to
// this discord SDK boilerplate will be much less than the time
// restarting the full staging discord server for every html/css change.

// Discord API
export class DiscordAPI {
    constructor() {
        this.auth = {};
        this.discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
    }

    async Init() {
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

        // Note: the access_token returned is a sensitive secret and should be treated as such
        const { access_token } = await response.json();

        // Authenticate with Discord clent (using the access_token)
        auth = await discordSdk.commands.authenticate({
            access_token,
        });

        if (auth == null) {
            throw new Error("Authenticate command failed");
        }
    }

    GuildID() {
        return this.discordSdk.guildId;
    }

    ChannelID() {
        return this.discordSdk.channelId;
    }

    async Guild(id) {
        // From the HTTP API fetch a list of all the user's guilds
        const guilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
                // NOTE: we're using the access_token provided by the "authenticate" command
                Authorization: `Bearer ${auth.access_token}`,
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json());

        // Find the current guild's info
        return guilds.find((g) => g.id === id);
    }

    async Channel(id) {
        return discordSdk.commands.getChannel({ channel_id: id });
    }
}

// Mock api for local dev and tests
export class DiscordDummyAPI {
    constructor() { }

    async Init() {
        console.log("Using dummy discord API . . .");
    }

    GuildID() {
        return "TEST_GUILD_0";
    }

    ChannelID() {
        return "TEST_CHANNEL_0";
    }

    async Guild(id) {
        return {
            'id': id,
            'icon': 'image'
        };
    }

    async Channel(id) {
        return {
            'id': 'TEST_CHANNEL_0',
            'name': 'Dummy Channel',
        };
    }
}
