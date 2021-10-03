const { MessageEmbed } = require('discord.js');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "color",
  alias: ["setcolor","changecolor","set-color","change-color"],
  admin: true,
  run: (client, message, command, args, prefix, color, lang) => {

    if (!color.startsWith('#')) color = `#${color}`;

      if (args[0]==null || args[0]=="") {
        const embed = new MessageEmbed()
        .setTitle(lang.current_color)
        .setDescription(color)
        .setColor(color)
        message.channel.send({embeds:[embed]});
      } else {
        var requestedColor = args[0];
        if (requestedColor.length == 3) requestedColor = requestedColor + requestedColor
        if (!requestedColor.startsWith('#')) requestedColor = `#${requestedColor}`;
        const embed = new MessageEmbed()
        .setTitle(lang.change_color_to.replace('{0}', requestedColor))
        try {
          embed.setColor(requestedColor);
        } catch (e) {
          return message.reply(lang.invalid_color);
        }
        message.channel.send({embeds:[embed]}).then(confMsg => {
          confMsg.react("✅");
          confMsg.react("❌");

          const filter = (reaction, user) => user.id === message.author.id;
          const collector = confMsg.createReactionCollector({filter,  time: 15000 });
          collector.on('collect', r => {
            switch (r.emoji.name) {
              case '✅':
              changeColor(message, requestedColor, lang);
              confMsg.delete();
              break;
              case '❌':
              confMsg.delete();
              break;
            }
          });
          collector.on('end', (collected, reason) => {
            if (reason == 'time') {
              confMsg.delete();
              if (!message.deleted && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
            }
          });
        });
      }
  }
}

async function changeColor(message, newColor, lang) {
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
  await guilds.updateOne({id: guildID},{ $set: { color: newColor}});
  db.close();
  const embed = new MessageEmbed()
  .setTitle(lang.color_was_changed_to.replace('{0}',newColor))
  .setColor(newColor)
  message.channel.send({embeds:[embed]});
}
