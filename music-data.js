/**
 * Плейлист: только треки, где файл совпадает с названием записи.
 * Хиты (Mgzavrebi и др.) и студийные альбомы без открытой лицензии сюда не входят —
 * их можно добавить вручную в audio/music/ и в этот файл.
 *
 * Сейчас с Wikimedia Commons (PD): Chakrulo (1957), Shen Khar Venakhi.
 * Rustavi Choir «Georgian Voices» — см. tools/fetch_rustavi_choir.sh (archive.org).
 */
window.MUSIC_BY_CATEGORY = {
  modern: [],
  folk: [
    {
      title: "Chakrulo",
      artist: "Georgian State Folk Song and Dance Ensemble",
      file: "audio/music/chakrulo.mp3",
      credit: "Запись 1957 · общественное достояние (Wikimedia Commons)",
    },
    {
      title: "Shen Khar Venakhi",
      artist: "Bichebi (хор)",
      file: "audio/music/shen_khar_venakhi.mp3",
      credit: "Средневековый грузинский гимн · PD (Wikimedia Commons)",
    },
  ],
  instrumental: [],
};

window.MUSIC_CATEGORY_LABELS = {
  modern: "Современные хиты",
  folk: "Народные · полифония",
  instrumental: "Инструментал · атмосфера",
};
