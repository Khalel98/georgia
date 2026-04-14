/**
 * Плейлист: только треки, где файл совпадает с названием записи.
 * Хиты (Mgzavrebi и др.) и студийные альбомы без открытой лицензии сюда не входят —
 * их можно добавить вручную в audio/music/ и в этот файл.
 *
 * Сейчас с Wikimedia Commons (PD): Chakrulo (1957), Shen Khar Venakhi.
 * Rustavi Choir «Georgian Voices» — см. tools/fetch_rustavi_choir.sh (archive.org).
 */
window.MUSIC_BY_CATEGORY = {
  modern: [
    {
      title: "Georgian Disco",
      artist: "Niko's Band",
      file: "audio/music/Niko's Band - Georgian Disco.mp3",
      credit: "Локальный файл",
    },
    {
      title: "Sakartveloa",
      artist: "Mgzavrebi",
      file: "audio/music/Mgzavrebi_-_Sakartveloa_(musmore.org).mp3",
      credit: "Локальный файл",
    },
    {
      title: "Mikvarxar Metki",
      artist: "Megi Gogitidze",
      file: "audio/music/mikvarxar metki - megi gogitidze.mp3",
      credit: "Локальный файл",
    },
  ],
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
    {
      title: "Apareka",
      artist: "Trio Mandili",
      file: "audio/music/Trio_Mandili_-_Apareka_(SkySound.cc).mp3",
      credit: "Локальный файл",
    },
  ],
  instrumental: [],
};

window.MUSIC_CATEGORY_LABELS = {
  modern: "Современные хиты",
  folk: "Народные · полифония",
  instrumental: "Инструментал · атмосфера",
};
