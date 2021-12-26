const { MessageEmbed } = require('discord.js');
const connectToDatabase = require('../utils/connectToDatabase.js');

module.exports = {
  name: "prefix",
  alias: ["setprefix","changeprefix","prefixset","set-prefix","change-prefix"],
  admin: true,
  run: (client, message, command, args, prefix, color, lang) => {

      if (args[0]==null || args[0]=="") {
        message.channel.send(lang.the_current_prefix_is.replace('{0}', prefix))
      } else {
        message.channel.send(lang.change_prefix_to.replace('{0}', args[0])).then(confMsg => {
          confMsg.react("✅");
          confMsg.react("❌");

          const filter = (reaction, user) => user.id === message.author.id;
          const collector = confMsg.createReactionCollector({filter,  time: 15000 });
          collector.on('collect', r => {
            switch (r.emoji.name) {
              case '✅':
              changePrefix(message, args[0], lang);
              confMsg.delete();
              break;
              case '❌':
              confMsg.delete();
              break;
            }
          });
          collector.on('end', (collected, reason) => {
            if (reason == 'time') {
              try {
                confMsg.delete();
                message.delete();
              } catch (e) {}
            }
          });
        });
      }
  }
}

async function changePrefix(message, newPrefix, lang) {
  const guildID = message.guild.id;
  const db = await connectToDatabase();
  const guilds = db.db("chrysalis").collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  await guilds.updateOne({id: guildID},{ $set: { prefix: newPrefix}});
  db.close();
  message.channel.send(lang.prefix_was_changed_to.replace('{0}', newPrefix));
}
