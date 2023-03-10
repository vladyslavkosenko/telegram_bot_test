const { Telegraf, Markup } = require('telegraf');
const { Keyboard } = require('telegram-keyboard')
const LocalSession = require('telegraf-session-local')

const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const telegramBotToken = '6008841185:AAH85ITEUmoKUavjFIEvHhk8eW_nsfpINjI';
if (!telegramBotToken) {
  throw new Error('TELEGRAM_BOT_TOKEN not found');
}

// Define the application types
const appTypes = [
  { label: '๐ค Bot', value: 'bot' },
  { label: '๐ Plugin', value: 'plugin' },
  { label: '๐ Frontend app', value: 'frontend' },
  { label: '๐ฅ๏ธ Backend app', value: 'backend' },
  { label: '๐ป Console app', value: 'console' },
  { label: '๐งต Middleware app', value: 'middleware' },
  { label: '๐๏ธ Database', value: 'database' },
  { label: '๐ก API', value: 'api' },
  { label: '๐ Library', value: 'library' },
  { label: '๐ง Service', value: 'service' },
];


const appPlatforms = {
  'bot': [
    { label: '๐ค Telegram', value: 'telegram' },
    { label: '๐ฑ WhatsApp', value: 'whatsupbot' },
    { label: '๐จ๐ณ WeChat', value: 'wechatbot' },
    { label: '๐ Line', value: 'linebot' },
  ],
  'plugin': [
    { label: '๐๏ธ Magento2', value: 'magento2' },
    { label: '๐ WordPress', value: 'wordpress' },
  ]
};


// Define the programming languages
const progLangs = [
  { label: '๐จ JavaScript', value: 'javascript' },
  { label: '๐ฆ TypeScript', value: 'typescript' },
  { label: '๐น Go', value: 'golang' },
  { label: '๐ PHP', value: 'php' },
  { label: '๐ข C#', value: 'c#' },
  { label: '๐ก C++', value: 'c++' },
  { label: '  Nocode', value: 'nocode' },
];

// Create a new Telegraf instance
const bot = new Telegraf(telegramBotToken);

// Use session middleware to store user data
//bot.use(session());
bot.use((new LocalSession({})).middleware())

const steps = {

};

// Enable command menu
const commands = [
  { command: 'start', description: 'Start the bot' },
  { command: 'newproject', description: 'Start new project' },  
  { command: 'projects', description: 'Show projects list' },
  { command: 'steps', description: 'Show steps list' },
  { command: 'step_restart', description: 'Step restart' },
  { command: 'step_next', description: 'Step next' },
  //{ command: 'help', description: 'Get help' },
];
bot.telegram.setMyCommands(commands);



// Start command
bot.start((ctx) => {
  /*
  const keyboard = Keyboard.make([
    { text: '/command1', callback_data: 'command1', description: 'Description of command1' },
    { text: '/command2', callback_data: 'command2', description: 'Description of command2' },
    { text: '/command3', callback_data: 'command3', description: 'Description of command3' },
    { text: '/command4', callback_data: 'command4', description: 'Description of command4' }
  ], { columns: 1, resize_keyboard: true, one_time_keyboard: true });

  ctx.reply('Simple built-in keyboard', keyboard.reply())
  //await ctx.reply('Simple inline keyboard', keyboard.inline())
  */
  ctx.reply('๐ Welcome to iCode Bot.');



  ctx.reply('๐ Please select the application type:', Markup.inlineKeyboard(
    appTypes.map(appType => [Markup.button.callback(appType.label, `appType:${appType.value}`)])
  ));

});


bot.command('help', (ctx) => {
  ctx.reply('This is a help message. How can I assist you?');
});

// Enable command menu
bot.command('menu', (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, 'Command Menu', {
    reply_markup: {
      keyboard: [
        [{ text: '/start', description: 'Start the bot' }, { text: '/help', description: 'Get help' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});


// Handle application type selection
bot.action(/appType:(.*)/, (ctx) => {
  const appType = ctx.match[1];
  ctx.session.appType = appType;
  ctx.reply(`โ Selected application type: ${appType}.`)
  // Check if the selected app type requires another selection
  if (appPlatforms[appType]) {
    ctx.reply(`๐ Please select the app platform:`, Markup.inlineKeyboard(
      appPlatforms[appType].map(appPlatform => Markup.button.callback(appPlatform.label, `appPlatform:${appPlatform.value}`))
    ));
  } else {
    ctx.reply(`๐ Please select the programming language:`, Markup.inlineKeyboard(
      progLangs.map(progLang => Markup.button.callback(progLang.label, `progLang:${progLang.value}`))
    ));
  }
});

bot.action(/appPlatform:(.*)/, (ctx) => {
  const appPlatform = ctx.match[1];
  ctx.session.appType = appPlatform;
  ctx.reply(`โ Selected application platform: ${appPlatform}.`)
  ctx.reply(`๐ Please select the programming language:`, Markup.inlineKeyboard(
    progLangs.map(progLang => Markup.button.callback(progLang.label, `progLang:${progLang.value}`))
  ));
});

// Handle programming language selection
bot.action(/progLang:(.*)/, (ctx) => {
  const progLang = ctx.match[1];
  ctx.session.progLang = progLang;
  ctx.reply(`โ Selected programming language: ${progLang}.`);
  ctx.reply(`๐ Please enter the project name:`);
});

// Handle project name input
bot.hears(/^[A-Za-z0-9-_]+$/, (ctx) => {
  const projectName = ctx.message.text;
  ctx.session.projectName = projectName;
  ctx.reply('Please enter the project details:');
});

// Handle project details input
bot.on('text', (ctx) => {
  const projectDetails = ctx.message.text;
  ctx.session.projectDetails = projectDetails;
  ctx.reply('Please confirm the project details:', Markup.inlineKeyboard([
    Markup.button.callback('โ Confirm', 'confirm'),
    Markup.button.callback('โ Cancel', 'cancel'),
  ]));
});

// Handle confirmation of project details
bot.action('confirm', (ctx) => {
  const appType = ctx.session.appType;
  const appPlatform = ctx.session.appPlatform;
  const progLang = ctx.session.progLang;
  const projectName = ctx.session.projectName;
  const projectDetails = ctx.session.projectDetails;

  // Generate iCode.json file with project details
  const icode = {
    appType,
    appPlatform,
    progLang,
    projectName,
    projectDetails,
  };

  // Send iCode.json file to the user
  ctx.replyWithDocument({
    source: Buffer.from(JSON.stringify(icode)),
    filename: projectName + '.icode.json',
  });

  // Clear user session data
  ctx.session = null;
});





/*
// Handle cancellation of project details
bot.action('cancel', (ctx) => {
  ctx.reply('Project creation cancelled. Please start over.');
  // Clear user session data
  ctx.session
*/





// Handle errors
/*
  bot.catch((err, ctx) => {
  console.log(`Error occurred for user ${ctx.from.id}: ${err}`);
  ctx.reply('An error occurred. Please try again later.');
});
*/

// Start the bot
bot.launch();


