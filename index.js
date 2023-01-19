require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Extra, Stage, Telegraf, Markup, session, Scenes } = require("telegraf");
var bot = new Telegraf(process.env.TOKEN);
const dataInput = require("./src/Scenes");
const axios = require("axios");
const app = new express();

//config http server
app.use(express.json());
app.use(cors({ origin: "*" }));

//describe scenes
const stage = new Scenes.Stage([dataInput]);
bot.use(session());
bot.use(stage.middleware());

//entry point
bot.command("/start", async (ctx) => {
  await ctx.reply(
    "Привет, тут будет пример + инструкция по использованию бота "
  );
  // await ctx.replyWithDocument({ source: "./test.json" });

  ctx.scene.enter("DATA_WIZARD_SCENE");
});

bot.hears("hi", (ctx) => {
  ctx.reply(
    "Теперь выберем ваш предмет",
    Markup.inlineKeyboard([
      Markup.button.webApp(
        "Выбор предмета",
        `https://663d-93-159-232-246.eu.ngrok.io/displaytable?query=${encodeURI(
          "массажер"
        )}`
      ),
    ])
  );
});
bot
  .launch
  //   {
  //   webhook: {
  //     domain: "https://4f99-185-165-163-103.eu.ngrok.io",
  //     port: "8080",
  //   },
  // }
  ();

const PORT = 8000;
app.use(cors({ origin: "*" }));

//small api for webapp data forwarding
app.get("/hi", async (req, res) => {
  res.send("Hello World!");
});
app.get("/api/:query", async (req, res) => {
  const query = req.params.query;
  var config = {
    //env.config
  };
  const data = await axios(config).then(async (response) => {
    console.log(response.data);
    return JSON.stringify(response.data);
  });
  console.log(data);
  await res.send(data);
});

app.post("/api/web-data", async (req, res) => {
  const { queryId, subject = [] } = req.body;
  // callback(subject, "subject");

  try {
    await bot.telegram.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Предмет выбран",
      input_message_content: {
        message_text: `Вы успешно выбрали предмет `,
      },
    });
    return res.status(200).json({});
  } catch (err) {
    await bot.telegram.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "вы не выбрали товар ",
      input_message_content: {
        message_text: " вы не выбрали товар  ",
      },
    });

    return res.status(500).json({});
  }
});

app.listen(PORT, () => console.log("Server started"));
// const getInvoice = (id) => {
//   const invoice = {
//     chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
//     provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот @SberbankPaymentBot
//     start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
//     title: "InvoiceTitle", // Название продукта, 1-32 символа
//     description: "InvoiceDescription", // Описание продукта, 1-255 знаков
//     currency: "RUB", // Трехбуквенный код валюты ISO 4217
//     prices: [{ label: "Invoice Title", amount: 100 * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
//     photo_url:
//       "https://s3.eu-central-1.wasabisys.com/ghashtag/JavaScriptBot/Unlock.png", // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
//     photo_width: 500, // Ширина фото
//     photo_height: 281, // Длина фото
//     payload: {
//       // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
//       unique_id: `${id}_${Number(new Date())}`,
//       provider_token: process.env.PROVIDER_TOKEN,
//     },
//   };

//   return invoice;
// };
