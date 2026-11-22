import dotenv from 'dotenv'
import {Bot} from 'grammy'
import {gameOptions, againOptions} from "./options.js";

dotenv.config()

const token = process.env.token

const bot = new Bot(token)

const chats = {}

const generateRandomNumber = async (ctx) => {
    const chatId = ctx.chat.id
    await ctx.reply("угадай число от 0 до 9")
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await ctx.reply("отгадывай", gameOptions)
}

const start = async () => {
    await bot.api.setMyCommands([
        {command: 'start', description: 'запустить'},
        {command: 'info', description: 'информация'},
        {command: 'game', description: 'угадай число'},
        {command: 'help', description: 'помощь'},
    ])

    bot.on('message:text', async (ctx) => {

        const text = ctx.message.text
        const chadId = ctx.chat.id

        if (text === '/start') {
            await ctx.replyWithSticker('CAACAgIAAxkBAAMUawLbBL-Z7e2X02UM1ccmTicfpxIAAto1AAJ5sAFKpLb5HvzLl_E9BA')
            return ctx.reply('бот запущен')
        }

        if (text === '/info') {
            return ctx.reply(`тебя зовут ${ctx.from.first_name}`)
        }

        if (text === '/game') {
            return generateRandomNumber(ctx)
        }

        return ctx.reply("команда не распознана")

    })

    bot.on('message:sticker', async (ctx) => {
        const fileId = ctx.message.sticker.file_id
        await ctx.reply(`id стикера: ${fileId}`)
        await ctx.replyWithSticker(fileId)
    })

    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data
        const chatId = ctx.chat.id

        await ctx.answerCallbackQuery()

        if (data === '/again') {
            return generateRandomNumber(ctx)
        }

        await ctx.reply("вы нажали на кнопку")

        if (Number(data) === chats[chatId]) {
            delete chats[chatId]
            return ctx.reply(`ты угадал, ${data}`, againOptions)
        } else {
            return ctx.reply(`не угадал, ${chats[chatId]}`, againOptions)
        }

    })

    console.log("бот запущен")
    await bot.start()
}

start()