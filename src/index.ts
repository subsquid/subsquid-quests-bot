import { Client, Collection, Intents } from 'discord.js'


const discordBotToken = process.env.TOKEN || undefined // environment variable TOKEN must be set

;(async () => {
  
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    // client.commands = new Collection();

    client.once("ready", async () => {
      console.log('Discord.js client ready');
    });
    
    await client.login(discordBotToken); 
    console.log('Bot logged in successfully');    
    
})()
