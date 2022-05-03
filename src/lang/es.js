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

const emojis = require('../emojis.js');

module.exports = {
  meta: {
    name: 'Español',
    new_lang_message: 'Ahora hablaré en español.'
  },
  author: 'Autor',
  message: 'Mensaje',
  channel: 'Canal',
  user_commands: 'Comandos:',
  admin_commands: 'Comandos de administradores:',
  // DO NOT TRANSLATE COMMAND NAMES
  commands: [
    {
      name: 'avatar',
      description: 'Envía el avatar del usuario.',
      options: [
        {
          name: 'usuario',
          type: 'USER',
          description: 'El usuario del que enviar el avatar.'
        }
      ]
    },
    {
      name: 'userinfo',
      description: 'Muestra información sobre el usuario.',
      options: [
        {
          name: 'usuario',
          type: 'USER',
          description: 'El usuario del que mostrar la información.'
        }
      ]
    },
    {
      name: 'roleinfo',
      description: 'Envía información sobre el rol.',
      options: [
        {
          name: 'rol',
          type: 'ROLE',
          description: 'Rol del que mostrar la información.',
          required: true
        }
      ]
    },
    {
      name: 'serverinfo',
      description: 'Muestra información sobre el servidor.'
    },
    {
      name: 'rank',
      description: 'Muestra tu nivel y experiencia actual.',
      options: [
        {
          name: 'usuario',
          type: 'USER',
          description: 'El usuario del que mostrar el nivel.'
        }
      ]
    },
    {
      name: 'leaderboard',
      description: 'Muestra los usuarios con más experiencia.'
    },
    {
      name: 'profile',
      description: 'Edita tu perfil (en todos los servidores).',
      options: [
        {
          name: 'color',
          type: 'STRING',
          description: 'El color hexadecimal para tu perfil.'
        },
        {
          name: 'imagen_de_fondo',
          type: 'STRING',
          description: 'La URL de la imagen de fondo para tu perfil.'
        }
      ]
    },
    {
      name: 'emoji',
      description: 'Envía el emoji como una imagen.',
      options: [
        {
          name: 'emoji',
          type: 'STRING',
          description: 'El emoji que quieres convertir en imagen.',
          required: true
        }
      ]
    },
    {
      name: 'love',
      description: 'Comprueba el nivel de compatibilidad entre dos usuarios.',
      options: [
        {
          name: 'amante1',
          type: 'USER',
          description: 'El primer miembro de la pareja.',
          required: true
        },
        {
          name: 'amante2',
          type: 'USER',
          description: 'El segundo miembro de la pareja.',
          required: true
        }
      ]
    },
    {
      name: 'boop',
      description: 'Hace boop a un usuario.',
      options: [
        {
          name: 'usuario',
          type: 'USER',
          description: 'El usuario al que quieres hacer boop.',
          required: true
        }
      ]
    },
    {
      name: 'hug',
      description: 'Abraza a un usuario.',
      options: [
        {
          name: 'usuario',
          type: 'USER',
          description: 'El usuario al que quieres abrazar.',
          required: true
        }
      ]
    },
    {
      name: 'kiss',
      description: 'Besa a un usuario.',
      options: [
        {
          name: 'usuario',
          type: 'USER',
          description: 'El usuario al que quieres besar.',
          required: true
        }
      ]
    },
    {
      name: 'booru',
      description: 'Envía una imagen de Manebooru.',
      options: [
        {
          name: 'tags',
          type: 'STRING',
          description: 'Tags para buscar (separados por comas).'
        }
      ]
    },
    {
      name: 'clop',
      description: 'Envía una imagen clop de Manebooru.',
      options: [
        {
          name: 'tags',
          type: 'STRING',
          description: 'Tags para buscar (separados por comas).'
        }
      ]
    },
    {
      name: 'e621',
      description: 'Envía una imagen de e621.',
      options: [
        {
          name: 'tags',
          type: 'STRING',
          description: 'Tags para buscar (separados por espacios).'
        }
      ]
    },
    {
      name: 'torrent',
      description: '¡Ponis por torrent!'
    },
    {
      name: 'say',
      description: 'Chrysalis dice lo que escribas.',
      options: [
        {
          name: 'texto',
          type: 'STRING',
          description: 'Lo que quieres que Chrysalis diga.',
          required: true
        }
      ]
    }
  ],
  // DO NOT TRANSLATE COMMAND NAMES
  help: {
    user: {
      avatar: ['avatar {usuario}', 'Envía la foto de perfil del usuario mencionado. También puedes escribir su ID de usuario.'],
      userinfo: ['userinfo {usuario}', 'Muestra información sobre el usuario. Puedes usar una mención o la ID del usuario.'],
      roleinfo: ['roleinfo {rol}', 'Muestra información sobre el rol. Puedes escribir el nombre del rol para buscarlo.'],
      serverinfo: ['serverinfo','Muestra información sobre el servidor.'],
      rank: ['rank {usuario (opcional)}','Muestra tu nivel y experiencia actual.'],
      leaderboard: ['leaderboard','Muestra los usuarios con más experiencia.'],
      profile: ['profile {campo} {nuevo valor}','Edita tu perfil (en todos los servidores).'],
      emoji: ['jumbo {emoji}', 'Envía el emoji como una imagen.'],
      love: ['love {usuario 1} {usuario 2 (opcional)}', 'Comprueba tu nivel de compatibilidad entre dos usuarios. Si solo escribes un usuario el otro serás tú.'],
      boop: ['boop {usuario}', 'Hace boop a un usuario.'],
      hug: ['hug {usuario}', 'Abraza a un usuario.'],
      kiss: ['kiss {usuario}', 'Besa a un usuario.'],
      booru: ['booru {búsqueda (opcional)}', 'Envía una imagen de Manebooru. Puedes escribir tags para buscar.'],
      clop: ['clop {búsqueda (opcional)}', 'Envía una imagen clop de Manebooru. Puedes escribir tags para buscar. Solo se puede usar en canales NSFW.','NSFW'],
      e621: ['e621 {búsqueda (opcional)}', 'Envía una imagen de e621. Puedes escribir tags para buscar. Solo se puede usar en canales NSFW.','NSFW'],
      torrent: ['torrent', '¡Ponis por torrent!'],
      say: ['say {texto}', 'Chrysalis dice lo que escribas.']
    },
    admin: [
      ['setprefix {prefijo}', 'Establece el prefijo de los comandos del bot en este servidor.'],
      ['setlang {idioma}', 'Establece el idioma del bot en este servidor.'],
      ['setcolor {hex}', 'Establece el color hexadecimal predeterminado para mesajes de tipo embed.'],
      ['addword {palabra}', 'Bloquea una palabra en el servidor.'],
      ['delword {palabra}', 'Desbloquea una palabra en el servidor.'],
      ['addwords {palabras}','Bloquea una frase en el servidor.'],
      ['delwords {palabras}', 'Desbloquea una frase en el servidor.'],
      ['listwords', 'Muestra la lista de palabras y frases bloqueadas.'],
      ['clean {número de mensajes}', 'Elimina un puñado de mensajes. No puedes eliminar mensajes que sean de hace más de dos semanas.'],
      ['enable {módulo}', 'Activa un módulo.'],
      ['disable {módulo}', 'Desactiva un módulo.'],
      ['config {módulo}', 'Edita un módulo.'],
      ['reset {módulo}', 'Reinicia un módulo.'],
      ['rolemenu {roleID} {roleID} {roleID}...', 'Crea un menú de roles. Cada argumento es la ID de un rol.'],
      ['welcome {usuario}', 'Muestra cómo se vería la tarjeta de bienvenida del usuario mencionado.'],
      ['boost {usuario}', 'Muestra cómo se verá el mensaje cuando un usuario mejore el servidor.'],
      ['setxp {usuario} {xp}', 'Establece la cantidad de experiencia que tiene un usuario.'],
      ['importxp', 'Importa XP de otros bots de niveles.']
    ]
  },
  defaultValues: {
    boost: {
      message: '**¡{user} ha boosteado el servidor!**',
      title: '¡Muchas gracias por boostear el servidor!',
      description: `${emojis.boost} ¡Disfruta de tu rol exclusivo! ${emojis.boost}`
    },
    welcome: {
      message: '¡Bienvenid@ a **{guild}**! {user}'
    },
    goodbye: {
      message: 'Adiós, **{user}**. Esperamos volver a verte pronto.',
      banMessage: '**{user}** ha sido banead@ del servidor.'
    }
  },
  wrong_channel: 'El comando que has enviado no se puede usar en ese canal.',
  blocked_words: 'Palabras bloqueadas',
  list: 'Lista',
  word_s_blocked: 'Palabra(s) bloqueada(s)',
  word_s_unblocked: 'Palabra(s) desbloqueada(s)',
  word_s: 'Palabra(s)',
  word_s_blocked_by: 'Bloqueada(s) por',
  word_s_unblocked_by: 'Desbloqueada(s) por',
  message_deleted: 'Mensaje eliminado',
  message_deleted_dm: 'Se ha eliminado tu mensaje ya que estás tocando un tema que no permitimos en el servidor. Por favor, controla tu vocabulario y no trates de evadir la restricción. Esto se hace para mantener una buena convivencia.',
  you_must_send_an_emoji: 'Debes enviar un emoji.',
  couldn_t_find_that_emoji: 'No he podido encontrar ese emoji.',
  type_one_or_two_users: 'Escribe uno o dos usuarios.',
  self_love: 'Sé que el amor propio es importante, pero no seas narcisista.',
  lovemeter_messages: ['Lamentable.','Nada compatibles.','Muy bajo... Solo amigos.','Posiblemente queden como solo amigos.','Muy poco probable pero puede que haya algo.','Es probable que haya algo, pero no quiero dar ilusiones.','Es bastante probable que haya algo. Se puede intentar.','Bastante compatibles. Podrían ser una linda pareja.','Estos dos están liados seguro.','Pueden llegar a ser una hermosa pareja.','Están destinados a estar juntos para siempre.'],
  nsfw_only: 'Este comando solo puede ser enviado a un canal NSFW.',
  requested_by: 'Solicitado por',
  how_to_delete: 'Pulsa aquí si la imagen es inapropiada.',
  please_report: 'Por favor, reporta esta imagen para que no vuelva a aparecer.',
  role_info: 'Información del rol:',
  name: 'Nombre',
  color: 'Color',
  member_count: 'Número de miembros',
  date_created: 'Fecha en la que fue creado',
  couldn_t_find_that_user: 'No he podido encontrar a ese usuario.',
  user_info: 'Información de usuario:',
  user_id: 'ID de usuario',
  server_join_date: 'Fecha de ingreso al servidor',
  account_creation_date: 'Fecha de creación de la cuenta',
  roles: 'Roles',
  avatar: 'Avatar de {0}',
  no_new_words_added: 'No se han añadido palabras nuevas.',
  no_words_were_removed: 'No se ha eliminado ninguna palabra.',
  bulk_delete_two_weeks: 'No se pueden eliminar mensajes enviados hace más de dos semanas.',
  bulk_delete_missing_permissions: 'No tengo permiso para borrar mensajes en este canal.',
  bulk_delete_max_100: 'Solo puedes borar menos de 100 mensajes de golpe.',
  no_images_found: 'No se ha podido encontrar ninguna imagen.',
  jump_to_moment: 'Saltar al momento',
  the_current_prefix_is: 'El prefijo actual es **{0}**',
  the_current_prefix_for_this_server_is: 'El prefijo actual de este servidor es',
  change_prefix_to: '¿Cambiar el prefijo a **{0}**?',
  prefix_was_changed_to: 'El prefijo fue cambiado a **{0}**',
  valid_modules: 'Módulos válidos',
  available_languages: 'Idiomas disponibles',
  boop_title: '{0} le ha hecho boop a {1}',
  boop_self: '{0} se ha hecho boop a sí mism@',
  boop_chrysalis: '{0} trató de hacerle boop a Chrysalis',
  hug_title: '{0} ha abrazado a {1}',
  hug_self: '{0} se ha abrazado a sí mism@',
  hug_chrysalis: '{0} trató de abrazar a Chrysalis',
  kiss_title: '{0} le ha dado un beso a {1}',
  kiss_self: '{0} se ha besado a sí mism@',
  kiss_chrysalis: '{0} intentó besar a Chrysalis',
  server_info: 'Información del servidor:',
  server_id: 'ID del servidor',
  server_owner: 'Propietari@ del servidor',
  channels: 'Canales',
  server_boosts: 'Mejoras del servidor',
  image_source: 'Fuente de la imagen',
  please_specify_a_new_value: 'Por favor, especifica un nuevo valor.',
  value_must_be_true_or_false: 'El valor debe ser **true** o **false**.', // Do NOT translate **true** and **false**
  module_updated: '¡Módulo actualizado!',
  attachments: 'Archivos adjuntos',
  message_id: 'ID del mensaje',
  module_enabled: 'Módulo {0} habilitado',
  module_disabled: 'Módulo {0} deshabilitado',
  current_color: 'Color actual',
  change_color_to: '¿Cambiar color a {0}?',
  invalid_color: 'Color no válido',
  color_was_changed_to: 'Se ha cambiado el color a {0}',
  usage: 'Uso',
  role_menu: 'Menú de roles',
  select_the_roles_that_you_want: 'Selecciona los roles que quieras',
  you_can_only_add_up_to_25_roles_to_the_menu: 'Solo puedes añadir hasta 25 roles al menú.',
  manage_roles_permission_required: 'Chrysalis necesita el permiso `MANAGE_ROLES` para que los menús de roles funcionen.',
  chrysalis_role_too_low: 'El rol de Chrysalis está por debajo del rol que estás solicitando. Por favor, contacta a un administrador para que lo arregle.',
  roles_managed_by_integrations_cannot_be_manually_assigned: 'Los roles administrados por integraciones no pueden ser asignados manualmente.',
  download_emoji: 'Descargar emoji',
  please_type_a_valid_channel: 'Por favor, escribe un canal válido.',
  invalid_channel: 'Al menos uno de los canales que has introducido es inválido.',
  invite_the_bot: 'Invita al bot',
  website: 'Página web',
  support_server: 'Servidor de soporte',
  source_code: 'Código fuente',
  support_the_project: 'Apoya el proyecto',
  unkown_role: 'No he podido encontrar ese rol.',
  role_id: 'ID del rol',
  welcome: '¡Bienvenid@!',
  you_are_the_member_n: 'Eres el miembro Nº{0}',
  filter_not_found: 'Filtro no encontrado. Por favor, asegúrate  de que el filtro es público.',
  help_time_out: 'El tiempo para pasar las páginas se ha acabado.',
  old_message: 'Mensaje viejo',
  new_message: 'Mensaje nuevo',
  old_attachments: 'Antiguos archivos adjuntos',
  new_attachments: 'Nuevos archivos adjuntos',
  message_edited: 'Mensaje editado',
  season: 'Temporada',
  seasons: 'Temporadas',
  movies: 'Películas',
  torrent_footer: 'Chrysalis recomienda usar qBitTorrent, ya que no contiene anuncios y es de código abierto. Los enlaces son proporcionados por yayponies.no /)',
  error_fetching_episodes: 'No se han podido obtener los episodios en este momento. Por favor, inténtalo más tarde.',
  attach_files_permission_missing: 'Chrysalis no tiene permiso para enviar imágenes a este canal.',
  please_type_a_valid_positive_integer: 'Por favor, escribe un número entero positivo.',
  module_property_not_found: 'Propiedad del módulo no encontrada.',
  levelup: '**¡Has subido de nivel!**\nAhora eres nivel **{level}**.',
  leaderboard_title: 'Tabla de clasificación',
  level: 'Nivel',
  rank: 'Rango',
  total_xp: 'XP total',
  profile_fields_title: 'Puedes cambiar lo siguiente:',
  profile_updated: '¡Perfil actualizado!',
  unsupported_image_type: 'Tipo de imagen no soportado.',
  check_documentation: 'Haz clic en el nombre del módulo para abrir la documentación de este módulo.',
  import_levels_from: '¿De qué bot quieres importar los niveles?',
  no_levels_found: 'No se han encontrado niveles de {bot} en este servidor.',
  mee6_fix: 'Por favor, asegúrate de que tu tabla de clasificación de MEE6 es pública activando [esta opción](https://mee6.xyz/dashboard/921413532141101077/leaderboard).',
  xp_migration_adapt: 'La forma en que Chrysalis calcula niveles puede ser distinta a la de otros bots. ¿Qué quieres hacer?',
  import_levels_and_adapt_xp: 'Importar niveles y adaptar XP',
  import_xp_and_adapt_levels: 'Importar XP y adaptar niveles',
  import_leaderboard: 'La tabla de clasificacion quedará tal que así:',
  migration_complete: '¡Transferencia completada!',
  xp_successfully_imported: 'La XP se ha importado correctamente.'
}
