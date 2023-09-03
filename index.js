// Подключение библиотек
const app = require('express')(); // приложение app работает на базе Express
const bodyParser = require('body-parser');
const axios = require('axios');

// Входящие HTTP запросы обрабатываются библиотекой body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

port = 3001;

const url = 'https://api.exolve.ru/list/blacklist/v1/Add'; // точка доступа Exolve API для добавления номера в чёрный список
const apiKey = 'YOUR_API_KEY'; // API-ключ

async function addToBlacklist(number) {
  // пробуем добавить номер в чёрный список
  try {
    await axios({
      method: 'post',
      url: url,
      headers: { Authorization: 'Bearer ' + apiKey },
      data: {
        numbers: [`${number}`],
        comment: 'calls limit exceeded',
      },
    }).then((response) => {
      responseStatus = response.status; //записываем ответ от Exolve API в переменную
    });
  } catch (error) {
    return error.response.data.error; // возвращаем текст ошибки, если номер не был добавлен в чёрный список
  }
  return responseStatus; // возвращаем ответ от Exolve API (200OK статус при успешном добавлении номера в чёрный список)
}

var callers = []; // массив для хранения пар номер телефона + количество входящих звонков

function addCaller(phoneNumber) {
  // создаем объект для номера звонившего
  const caller = {
    phoneNumber: phoneNumber,
    numberOfCalls: 1,
  };
  // Проверяем, если ли в массиве users объект с указанным номером
  callerIndex = callers.findIndex((el) => el.phoneNumber == phoneNumber);

  if (callerIndex == -1) {
    // Если нет, добавляем созданный объект в массив
    callers.push(caller);
    return 1;
  } else {
    // Если есть, увеличиваем количество звонков на 1
    callers[callerIndex].numberOfCalls += 1;
    return callers[callerIndex].numberOfCalls;
  }
}

app.post('/', async (req, res) => {
  const phoneNumber = req.body.number_a; // Получаем номер звонящего из POST запроса от Exolve
  const numberOfCalls = addCaller(phoneNumber); // Добавляем номер в массив данных / заменяем количество входящих звонков у существующего номера
  console.log(numberOfCalls);
  if (numberOfCalls == 2) {
    // Если количество звонков стало 2 (можно установить любое число по желанию)
    const isAdded = await addToBlacklist(phoneNumber); // Добавляем номер в чёрный список
    console.log(isAdded);
  }
});

// Приложение будет слушать запросы на указанном выше порте
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
