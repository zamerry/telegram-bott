import dotenv from 'dotenv'
import {Bot} from 'grammy'
import {gameOptions, againOptions} from "./options.js";

import db from './db.js'

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

        if (text === '/help') {
            return ctx.reply("в разработке")
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

        if (Number(data) === chats[chatId]) {
            delete chats[chatId]

            const res = await db.query(
                `insert into information (chat_id, name, right_count, wrong_count)
                 values ($1, $2, 1, 0) on conflict (chat_id) do
                update set
                    right_count = information.right_count + 1,
                    name = excluded.name returning *`, [chatId, ctx.from.first_name]
            )

            const userStats = res.rows[0]
            return ctx.reply(`ты угадал, ${data}`, againOptions)
        } else {

            const res = await db.query(
                `insert into information (chat_id, name, right_count, wrong_count)
                 values ($1, $2, 0, 1) on conflict (chat_id) do
                update set
                    wrong_count = information.wrong_count + 1,
                    name = excluded.name returning *`, [chatId, ctx.from.first_name]
            )

            return ctx.reply(`не угадал, ${chats[chatId]}`, againOptions)
        }

    })

    console.log("бот запущен")
    await bot.start()
}

start()