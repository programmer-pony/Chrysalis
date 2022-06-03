/*

 Copyright (C) 2022 programmerpony

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const connectToDatabase = require('../utils/connectToDatabase.js');
const { MessageEmbed, TextInputComponent, MessageActionRow, MessageButton } = require('discord.js');
const Canvas = require('canvas');
const fields = ['color','bgURL'];

module.exports = {
  name: 'profile',
  alias: ['profile','editprofile'],
  modal: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    if (!message.author) return showModal(message, lang);

    let button = await message.reply({components:[new MessageActionRow().addComponents(new MessageButton({
      customId: 'profile-button',
      label: lang.profile,
      style: 'PRIMARY'
    }))]});
    let filter = (interaction) => interaction.user.id === message.author.id;
    let collector = button.createMessageComponentCollector({filter: filter,  time: 12_000 });
    collector.on('end', async (collected, reason) => {
      if (reason == 'time') try {
        await button.delete();
        await message.delete();
      } catch (e) {}
    });
    collector.on('collect', async (i) => {
      collector.stop();
      showModal(i, lang, button, message);
    });
  }
}

async function showModal(i, lang, button, message) {
  let data = await getData(i.member.id);
  await i.showModal({
    customId: 'profile',
    title: lang.profile,
    components: [
      new MessageActionRow().addComponents([
        new TextInputComponent({
          customId: 'color',
          label: lang.color,
          style: 'SHORT',
          value: data.color,
          placeholder: data.color.slice(0,100)
        })
      ]),
      new MessageActionRow().addComponents([
        new TextInputComponent({
          customId: 'bgURL',
          label: lang.background_image,
          style: 'SHORT',
          value: data.bgURL,
          placeholder: data.bgURL.slice(0,100)
        })
      ])
    ]
  });
  let filter = (interaction) => interaction.customId === 'profile';
  i.awaitModalSubmit({ filter, time: 120_000 })
    .then(async (answer) => {

      if (button && message) try {
        await button.delete();
        await message.delete();
      } catch (e) {}

      let result = new MessageEmbed();
      let newColor = answer.fields.getTextInputValue('color');
      let newBG = answer.fields.getTextInputValue('bgURL');
      
      if (newColor) {
        newColor = `#${newColor.replaceAll('#','').repeat(6).slice(0,6)}`;
        try {
          result.setColor(newColor);
        } catch (e) {
          return answer.reply({content:lang.invalid_color, ephemeral:true});
        }
      }
  
      if (newBG) {
        try {
          await Canvas.loadImage(newBG);
        } catch (e) {
          return answer.reply({content:lang.unsupported_image_type, ephemeral:true});
        }
      }
  
      if (!newColor && !newBG) return answer.reply({content:lang.please_specify_a_new_value, ephemeral:true});

      let db = await connectToDatabase();
      let users = db.db('chrysalis').collection('users');
      let userPrefs = await users.findOne({id:i.member.id});
      if (newColor) await users.updateOne({id: i.member.id},{ $set: { color: newColor}});
      if (newBG) await users.updateOne({id: i.member.id},{ $set: { bgURL: newBG}});
      db.close();
  
      result
        .setTitle(lang.profile_updated)
        .setImage(newBG || userPrefs.bgURL)
        .setColor(newColor || userPrefs.color || guildInfo.color);
      return answer.reply({embeds:[result], ephemeral:true});

    }).catch(r => {});
}

async function getData(id) {
  let db = await connectToDatabase();
  let users = db.db('chrysalis').collection('users');
  let userPrefs = await users.findOne({id:id});
  if (!userPrefs) {
    await users.insertOne({id:id});
    userPrefs = await users.findOne({id:id});
  }
  db.close();
  return userPrefs;
}