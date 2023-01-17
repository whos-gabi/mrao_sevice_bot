# MRAO Telegram Bot
### The way it works:
Bot is accessing http://asp.gov.md api to find the most recent date of an appointment.

### asp.gov.md API:

Bot is using this predefined list of options:
```
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
```

Then it's sending a GET request on this endpoint, with the <b>category_id</b> chosen by the user:
``https://programaredl.asp.gov.md/qwebbook/rest/schedule/services/{category_id}/branches``

The response is then mapped into a list of city and city id's: 
``options_city_list.push({ option: data.addressCity, id: data.id });``

After the user selected preferred category and city the code executed the following GET request to get a list of available dates for appointment:
``https://programaredl.asp.gov.md/qwebbook/rest/schedule/branches/{city_id}/services/{category_id}/dates``

### Setup and Instalation:

<b>Make sure you have node.js installed</b>

<u>Linux/Mac OS:</u>

Git clone the code:
```sh
git clone https://github.com/whos-gabi/mrao_sevice_bot.git
```

Replace your token from @BotFather in `.env` file

Init node_modules:
```sh
npm i --save
```

Start the code:
```sh
nodemon index.js 
```
or
```sh
node index.js
```


