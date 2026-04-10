/**
 * Маршрут(ы) в Google Картах на один пункт расписания.
 * null — кнопок нет.
 * Строка — одна кнопка «Проложить маршрут» (запрос в Google — латиницей).
 * Пара из двух строк ["Название", "запрос"] — один маршрут (подпись + запрос в Google).
 * Несколько маршрутов: вложенные пары [["А", "q1"], ["Б", "q2"], …].
 * Одна строка в списке — подпись на кнопке до первой запятой.
 */
window.EVENT_ROUTES = [
  null,
  "Tbilisi, Georgia",
  ["Квартира (Самтредия 6)", "6 Samtredia Street, Tbilisi, Georgia"],
  "Bridge of Peace, Tbilisi, Georgia",
  "Sarke Restaurant, Tbilisi, Georgia",
  null,
  [
    ["Хроника Грузии", "Chronicle of Georgia, Tbilisi, Georgia"],
    ["Джвари", "Jvari Monastery, Mtskheta, Georgia"],
    ["Светицховели", "Svetitskhoveli Cathedral, Mtskheta, Georgia"],
  ],
  "Mtskheta, Georgia",
  null,
  "Borjomi Central Park, Georgia",
  null,
  null,
  [
    ["Апартаменты Orbi City", "Orbi City, Batumi, Georgia"],
    ["Набережная", "Batumi Boulevard, Georgia"],
  ],
  null,
  "Makhuntseti Waterfall, Adjara, Georgia",
  "Cafe Bar SherGebuli, Georgia",
  "Ali and Nino Statue, Batumi, Georgia",
  null,
  "Piazza Square, Batumi, Georgia",
  "Piazza Square, Batumi, Georgia",
  null,
  "Batumi Hopa Market, Georgia",
  null,
  "Grand Mall Batumi, Georgia",
  "Europe Square, Batumi, Georgia",
  null,
  null,
  "Batumi Botanical Garden, Georgia",
  "Fishlandia Restaurant, Batumi, Georgia",
  "Batumi Central Market, Georgia",
  null,
  "Alphabet Tower, Batumi, Georgia",
  null,
  null,
  null,
  "Ukrainochka Restaurant, Batumi, Georgia",
  null,
  [
    "Гостевой дом (Мераб Костава 11)",
    "11 Merab Kostava Street, Kutaisi, Georgia",
  ],
  "Medea Bar, Kutaisi, Georgia",
  "White Bridge, Kutaisi, Georgia",
  null,
  "Prometheus Cave, Kumistavi, Georgia",
  "Khinkali House Plus, Tsqaltubo, Georgia",
  "Martvili Canyon, Georgia",
  "Sisters Restaurant, Kutaisi, Georgia",
  null,
  "Kutaisi International Airport, Georgia",
];
