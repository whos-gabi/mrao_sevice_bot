const TelegramBot = require("node-telegram-bot-api");

require('dotenv').config();
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
const axios = require("axios");
const bot = new TelegramBot(token, { polling: true });

//https://programaredl.asp.gov.md/qwebbook/rest/schedule/branches/{city_id}/services/{service_option}/dates
const SUFIX = "/branches";
const BASE_SERV_URL =
  "https://programaredl.asp.gov.md/qwebbook/rest/schedule/services/";

const BASE_BRANCH_URL =
  "https://programaredl.asp.gov.md/qwebbook/rest/schedule/branches/";

let option_city_markup = [];
let options_city_list = [];
const options = [
  {
    option: "Cat. B - automat",
    id: "5f376aa9ee13b5ad5acf17162d973b340f92d305dfb5580e7cea2783ceedce42",
  },
  {
    option: "Cat. B - mecanic",
    id: "f4bac1a2f8d6e023084cfe8fd845a0ae68c776c6ab138622b5d864f59408b0b8",
  },
  {
    option: "Cat. B1",
    id: "7e2d7338d67a20dfc8de8e0c1f4d0f51bc6a2eb45b9b31ad7e44288f484ac84e",
  },
  {
    option: "Cat. BE",
    id: "4d0aa8b059fa493482ae20bd8f49c7a37d415b41523ec35374f56b7b955bf4b5",
  },
  {
    option: "Cat. C",
    id: "62903506369e60010f8914cbb9fdc418cba6029d34fab981c0747f1549bcdc4d",
  },
  {
    option: "Cat. C1",
    id: "ef5b17f773dca4242bc37d84eba82111f14d5a6152530f49a9852a86602d6039",
  },
  {
    option: "Cat. C1E",
    id: "b77cd797965ef643f811da735c6f6a6b72b6e35722c38fdb5ac556dfd63f967b",
  },
  {
    option: "Cat. CE",
    id: "44596a5f4afdb77cdc510e14a633236fc3a1763e8331eb2e55d83933ae9d97d2",
  },
  {
    option: "Cat. D",
    id: "eb744b8f085e86bf57498b5f1a72e6b556c5375262e78d94284f7f846dddde34",
  },
  {
    option: "Cat. D1",
    id: "224b2c0ce150ce9e99bcfc18883899e0a2248c65a0749a4b78d8628bb5beee14",
  },
  {
    option: "Cat. D1E",
    id: "b0cabe088fa6a5608ada1350b33741de29e135c43a1579a995faacff7fd22a12",
  },
  {
    option: "Examen Teoretic",
    id: "5223b67e2c04473fd70c78416d2df233a37a74234619a4154ed02a3a9e22f09c",
  },
];

let sel_category = "";
let sel_category_id = "";
let sel_city = "";
let sel_city_id = "";

let timer = null;
let current_date = "";

//BUG: initialising of multiple intervals for different starts of the bot

//https://programaredl.asp.gov.md/qwebbook/rest/schedule/branches/4b14f1345b0041497f9a047c53cc0fad7ff5e2ac16fb7054b0447265ad97efdd/services/4b14f1345b0041497f9a047c53cc0fad7ff5e2ac16fb7054b0447265ad97efdd/dates
//https://programaredl.asp.gov.md/qwebbook/rest/schedule/branches/4b14f1345b0041497f9a047c53cc0fad7ff5e2ac16fb7054b0447265ad97efdd/services/5223b67e2c04473fd70c78416d2df233a37a74234619a4154ed02a3a9e22f09c/dates

//------------------BOT COMMANDS------------------
bot.onText(/\/stop/, (message) => {
  clearInterval(timer);
  timer = null;
  sel_category = "";
  sel_category_id = "";
  sel_city = "";
  sel_city_id = "";
  current_date = "";
  bot.sendMessage(message.chat.id, "Botul a fost oprit");
  console.log(message.text);
});

bot.onText(/\/help/, async (message) => {
  console.log(message.text);
  let chatId = message.chat.id;
  bot.sendMessage(
    chatId,
    "Comenzile disponibile sunt: /start, /stop, /help, /date"
  );
  if (current_date != "" && sel_city_id && sel_category_id) {
    appointmentChecker(chatId, sel_city_id, sel_category_id);
    console.log("subscribtion active...");
  }
});

bot.onText(/\/date/, async (message) => {
  let chatId = message.chat.id;

  if (sel_category_id && sel_city_id) {
    let date = await getDate(sel_city_id, sel_category_id, BASE_BRANCH_URL);
    bot.sendMessage(chatId, "Ultima data disponibila este: " + formatDate(date));
  } else {
    bot.sendMessage(
      chatId,
      "Nu ai selectat categoria si/sau orasul, foloseste comanda /start pentru a incepe"
    );
  }
  if (current_date != "" && sel_city_id && sel_category_id) {
    appointmentChecker(chatId, sel_city_id, sel_category_id);
    console.log("subscribtion active...");
  }
});

bot.on("message", async (msg) => {
  console.log(msg);
  let chatId = msg.chat.id;
  if (msg.text[0] != "/") {
    bot.sendMessage(
      chatId,
      "Se pare ca acest mesaj nu este o comanda valida. Incearca /help."
    );
  }
});

//---------------START CONFIGURATION----------------
bot.onText(/\/start/, async (message) => {
  //reset all variables
  let chatId = message.chat.id;
  if (timer == null || timer == undefined || timer == "" || timer == 0) {
    clearInterval(timer);
    timer = null;
    sel_category = "";
    sel_category_id = "";
    sel_city = "";
    sel_city_id = "";
    current_date = "";
    //
    const category_options = {
      reply_markup: JSON.stringify({
        inline_keyboard: options.map((o) => {
          return [{ text: o.option, callback_data: o.id }];
        }),
      }),
    };

    bot.sendMessage(chatId, "Buna ziua! Alege o categorie", category_options);
  } else {
    bot.sendMessage(
      chatId,
      `Bot-ul este deja pornit. Foloseste comanda /stop pentru a opri`
    );
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const pickedOptionId = callbackQuery.data;
  try {
    if (await getOption(pickedOptionId, options)) {
      //if makes part of the category options

      let pickedOption = await getOption(pickedOptionId, options);
      bot.sendMessage(chatId, `Ati ales categoria: ${pickedOption}`);
      console.log(`Ati ales categoria: ${pickedOption}`);
      //define variables
      sel_category_id = pickedOptionId;
      sel_category = pickedOption;
      //
      await getCityId(pickedOptionId, chatId);
      bot.deleteMessage(chatId, messageId)
    } else if (await getOption(pickedOptionId, options_city_list)) {
      //if makes part of the city options
      let pickedOption = await getOption(pickedOptionId, options_city_list);
      //define variables
      sel_city_id = pickedOptionId;
      sel_city = pickedOption;
      bot.sendMessage(chatId, `Ati ales orasul: ${pickedOption}`);
      console.log(`Ati ales orasul: ${pickedOption}`);
      //get date
      current_date = await getDate(
        sel_city_id,
        sel_category_id,
        BASE_BRANCH_URL
      );
      bot.sendMessage(
        chatId,
        `Urmatoarea data disponibila: ${formatDate(current_date)}`
      );
      bot.sendMessage(
        chatId,
        `O sa va notificam urmatoarele zile disponibile...`
      );
      //start date subscription
      appointmentChecker(chatId, sel_city_id, sel_category_id);
      bot.deleteMessage(chatId, messageId)
    } else {
      //if something is wrong
      bot.sendMessage(chatId, `Ceva nu a mers bine :(`);
      bot.deleteMessage(chatId, messageId)
    }
  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "An error occurred");
  }
});
//get city_id
async function getCityId(option_id, chatId) {
  console.log("getting city id...");
  let resp = await getBaseUrlResp(option_id, BASE_SERV_URL, SUFIX);

  option_city_markup = {
    reply_markup: JSON.stringify({
      inline_keyboard: resp.data.map((data) => {
        //add city_id to the option_city_markup array
        options_city_list.push({ option: data.addressCity, id: data.id });
        return [{ text: data.addressCity, callback_data: data.id }];
      }),
    }),
  };
  // console.log("options_city: ", options_city_list);
  bot.sendMessage(chatId, "Alege Orasul:", option_city_markup);
}

//--------------------FUNCTIONS----------------------

function appointmentChecker(chatId, city_id, category_id) {
  console.log("checking for appointments...");
  timer = setInterval(async () => {
    let date = await getDate(city_id, category_id, BASE_BRANCH_URL);
    if (date !== current_date) {
      console.log("--- NEW DATE FOUND");
      current_date = date;
      bot.sendMessage(
        chatId,
        `${formatDate(date)} este noua data disponibila la MRAO.`
      );
    }
  }, 60 * 1000 * 3); // 3 minutes
}

async function getBaseUrlResp(id, BASE_SERV_URL, SUFIX) {
  let url = BASE_SERV_URL + id + SUFIX;
  try {
    let data = await axios.get(url);
    return data;
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}

async function getDate(city_id, category_id, BASE_BRANCH_URL) {
  //DEBUG
  console.log("fetching date...");
  // console.log("city_id: " + city_id);
  // console.log("category_id: " + category_id);
  let url = BASE_BRANCH_URL + city_id + "/services/" + category_id + "/dates";
  // console.log("URL:  " + url);
  try {
    let res = await axios.get(url);
    console.log("date: ", res.data[0].date);
    return res.data[0].date;
  } catch (err) {
    console.log(err);
    return "9999-99-99";
  }
}

//write a function to return option from an array of options
async function getOption(id, options) {
  let option = options.find((opt) => opt.id == id);
  return option ? option.option : undefined;
}

//write a funtion to get date in format YYYY-MM-DD and return it in format DD MMM YYYY
function formatDate(date) {
  let dateObj = new Date(date);
  const months = [
    "",
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];

  let day = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  let month = months[dateObj.getUTCMonth() + 1];
  let newdate = day + " " + month + " " + year;
  return newdate;
}
