const { MessageEmbed } = require('discord.js');
var lang = require('../lang/en.json');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "nsfw",
  alias: ["allownsfw", "allow-nsfw", "nsfw-allow", "nsfw-allowed", "nsfwallowed"],
  admin: true,
  run: (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);

      if (args[0]==null || args[0]=="") {
        message.reply('on/off ?')
      } else {
        if (args[0] == "on" || args[0] == "yes" || args[0] == "true") {
          switchNSFW(message, true);
        } else if (args[0] == "off" || args[0] == "no" || args[0] == "false") {
          switchNSFW(message, false);
        }
      }
  }
}

async function switchNSFW(message, allowNSFW) {
  const guildID = message.guild.id;
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild==null) return db.close();
  if (guild.color == null) return db.close();
  await guilds.updateOne({id: guildID},{ $set: { nsfw: allowNSFW}});
  db.close();
  return message.channel.send((allowNSFW) ? lang.nsfw_enabled : lang.nsfw_disabled);
}
