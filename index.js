const TelegramBot = require('node-telegram-bot-api');
const{gameOptions, againOptions} = require('./options')
const token = '6008841185:AAH85ITEUmoKUavjFIEvHhk8eW_nsfpINjI'
console.log('bot started')
const bot = new TelegramBot(token, {polling: true});
const chats = {}



const startGame = async (chatid) => {
    await bot.sendMessage(chatid, 'сейчас я загадаю цифру')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatid] = randomNumber
    await bot.sendMessage(chatid, 'отгадай число', gameOptions)

}
const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'start'},
        {command: '/test', description: 'test'},
        {command: '/game', description: 'game'},
    ])
    bot.on('message', async msg => {
        const text = msg.text;
        const chatid = msg.chat.id
        if (text === '/start') {
            return bot.sendMessage(chatid, 'начальное приветствие ')
        }
        if (text === '/test') {
            return bot.sendMessage(chatid, `тебя зовут ${msg.from.first_name}`)
        }
        if (text === '/game') {
            return startGame(chatid)
        }
        return bot.sendMessage(chatid, ' Я тебя не понимаю')
    })


    // Действия с кнопкой
    bot.on('callback_query', msg => {
        const data = msg.data
        const chatid = msg.message.chat.id
        if (data === '/again') {
           return  startGame(chatid)
        }
        if (data.toString() === chats[chatid].toString()) {
            return bot.sendMessage(chatid, `поздравляю ты отгадал ${chats[chatid]}`, againOptions)
        } else {
            return bot.sendMessage(chatid, `ты не отгадал ${chats[chatid]}`, againOptions)
        }
        //bot.sendMessage(chatid, `Ты выбрал цифру ${data}`)


    })

}
start()