const { Scenes, Markup, session } = require("telegraf");

const dataInput = new Scenes.WizardScene(
  "DATA_WIZARD_SCENE",
  (ctx) => {
    ctx.reply("Ваш артикул?");
    ctx.wizard.state.dataInputted = {};
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.dataInputted.article = Number(ctx.message.text);
    if (
      ctx.wizard.state.dataInputted.article &&
      ctx.wizard.state.dataInputted.article > 0
    ) {
      ctx.reply(
        `Какой ключевой ВЧ (высокочастотный) запрос (общий на уровне верхних категорий - рюкзак или рюкзак женский конкретно, в таком роде)?`
      );
      return ctx.wizard.next();
    }

    ctx.reply("Не верно, повторите запрос");
    return;
  },
  (ctx) => {
    ctx.wizard.state.dataInputted.query = ctx.message.text;
    ctx.reply(
      `Какая ваша выручка за последние 14 дней? Это нужно для оптимизации бюджета выкупов`
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.dataInputted.revenue = Number(ctx.message.text);
    if (
      ctx.wizard.state.dataInputted.revenue > 0 &&
      ctx.wizard.state.dataInputted.revenue
    ) {
      ctx.reply(
        "Сколько продаж было за последние  14 дней? Это нужно для оптимизации графика выкупов"
      );
      return ctx.wizard.next();
    }
    ctx.reply("Не верно, повторите запрос");
    return;
  },
  (ctx) => {
    ctx.wizard.state.dataInputted.sells = Number(ctx.message.text);
    if (
      ctx.wizard.state.dataInputted.sells > 0 &&
      ctx.wizard.state.dataInputted.sells
    ) {
      ctx.reply(
        "Какая ваша себестоимость? Это нужно для расчета экономики и окупаемости выкупов"
      );
      return ctx.wizard.next();
    }
    ctx.reply("Не верно, повторите запрос");
    return;
  },
  (ctx) => {
    ctx.wizard.state.dataInputted.rowCost = Number(ctx.message.text);
    if (
      ctx.wizard.state.dataInputted.rowCost > 0 &&
      ctx.wizard.state.dataInputted.rowCost
    ) {
      ctx.session.data = ctx.wizard.state.dataInputted;
      ctx.replyWithHTML(
        `Артикул: ${ctx.wizard.state.dataInputted.article}\n` +
          `Запрос: ${ctx.wizard.state.dataInputted.query}\n` +
          `Выручка: ${ctx.wizard.state.dataInputted.revenue}\n` +
          `Продажи: ${ctx.wizard.state.dataInputted.sells}\n` +
          `Себестоимость: ${ctx.wizard.state.dataInputted.rowCost}`,
        Markup.inlineKeyboard([
          Markup.button.webApp(
            "Выбор предмета",
            `https://${
              process.env.LOCAL_IP
            }:3000/displaytable?query=${encodeURI(
              ctx.wizard.state.dataInputted.query
            )}`
          ),
        ])
      );

      return ctx.wizard.next();
    }
  },
  (ctx) => {
    if (ctx.session.data) {
      const getInvoice = (id) => {
        const invoice = {
          chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
          provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот @SberbankPaymentBot
          start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
          title: "InvoiceTitle", // Название продукта, 1-32 символа
          description: "Оплата таблицы  ", // Описание продукта, 1-255 знаков
          currency: "RUB", // Трехбуквенный код валюты ISO 4217
          prices: [{ label: "Таблица", amount: 100 * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
          photo_url:
            "https://drive.google.com/file/d/1F0uDx2v9u7GgpCYlaFXn1kdwXHX3CNuo/view?usp=share_link", // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
          photo_width: 500, // Ширина фото
          photo_height: 281, // Длина фото
          payload: {
            // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
            unique_id: `${id}_${Number(new Date())}`,
            provider_token: process.env.PROVIDER_TOKEN,
          },
        };
        return invoice;
      };

      ctx.replyWithInvoice(getInvoice(ctx.from.id));
    }
  },
  (ctx) => {
    ctx.reply("Оплата прошла");
    return ctx.wizard.leave();
  }
);

module.exports = dataInput;
