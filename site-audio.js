/**
 * Единый аудиоэлемент для сайта: аудиогид и музыка не играют одновременно.
 * Громкость и mute — в localStorage (ключ gruziaSiteAudioPrefs).
 */
(function (global) {
  var LS_KEY = "gruziaSiteAudioPrefs";
  var audio = new Audio();
  audio.preload = "none";

  var mode = null;
  var musicMeta = { title: "", category: "" };
  var listeners = [];

  function dispatch(name, detail) {
    listeners.forEach(function (fn) {
      try {
        fn(name, detail || {});
      } catch (e) {
        /* ignore */
      }
    });
  }

  function loadPrefs() {
    try {
      var j = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return {
        volume:
          typeof j.volume === "number" && j.volume >= 0 && j.volume <= 1
            ? j.volume
            : 0.85,
        muted: !!j.muted,
      };
    } catch (e) {
      return { volume: 0.85, muted: false };
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ volume: prefs.volume, muted: prefs.muted })
      );
    } catch (e) {
      /* ignore */
    }
  }

  var prefs = loadPrefs();
  audio.volume = prefs.volume;
  audio.muted = prefs.muted;

  function normalizeSrc(src) {
    try {
      return new URL(src, global.location.href).href;
    } catch (e) {
      return String(src || "");
    }
  }

  function sameSrc(a, b) {
    return normalizeSrc(a) === normalizeSrc(b);
  }

  audio.addEventListener("timeupdate", function () {
    dispatch("timeupdate", {
      currentTime: audio.currentTime,
      duration: audio.duration,
    });
  });
  audio.addEventListener("loadedmetadata", function () {
    dispatch("loadedmetadata", { duration: audio.duration });
  });
  audio.addEventListener("durationchange", function () {
    dispatch("durationchange", { duration: audio.duration });
  });
  audio.addEventListener("ended", function () {
    dispatch("ended", {});
  });
  audio.addEventListener("play", function () {
    dispatch("play", { mode: mode });
  });
  audio.addEventListener("pause", function () {
    dispatch("pause", { mode: mode });
  });

  global.SiteAudio = {
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i !== -1) listeners.splice(i, 1);
      };
    },

    playGuide: function (src) {
      mode = "guide";
      musicMeta = { title: "", category: "" };
      if (!sameSrc(audio.src, src)) {
        audio.src = src;
      }
      audio.play().catch(function () {});
      dispatch("modechange", { mode: mode });
    },

    playMusic: function (src, meta) {
      mode = "music";
      musicMeta = meta || {};
      if (!sameSrc(audio.src, src)) {
        audio.src = src;
      }
      audio.play().catch(function () {});
      dispatch("modechange", { mode: mode });
    },

    pause: function () {
      audio.pause();
    },

    stopGuide: function () {
      if (mode === "guide") {
        audio.pause();
        audio.currentTime = 0;
        try {
          audio.removeAttribute("src");
          audio.load();
        } catch (e) {
          /* ignore */
        }
        mode = null;
        dispatch("modechange", { mode: mode });
      }
    },

    stopAll: function () {
      audio.pause();
      audio.currentTime = 0;
      try {
        audio.removeAttribute("src");
        audio.load();
      } catch (e) {
        /* ignore */
      }
      mode = null;
      musicMeta = { title: "", category: "" };
      dispatch("modechange", { mode: mode });
    },

    isGuidePlaying: function (src) {
      return (
        mode === "guide" &&
        !audio.paused &&
        (!src || sameSrc(audio.src, src))
      );
    },

    /** Тот же аудиогид на паузе (для подписи «Продолжить»). */
    isGuidePausedFor: function (src) {
      return (
        mode === "guide" &&
        !!src &&
        sameSrc(audio.src, src) &&
        audio.paused
      );
    },

    isMusicPlaying: function () {
      return mode === "music" && !audio.paused;
    },

    getMode: function () {
      return mode;
    },

    getMusicMeta: function () {
      return musicMeta;
    },

    getElement: function () {
      return audio;
    },

    setMuted: function (m) {
      prefs.muted = !!m;
      audio.muted = prefs.muted;
      if (!prefs.muted) {
        audio.volume = prefs.volume;
      }
      savePrefs();
      dispatch("mutechange", { muted: prefs.muted });
    },

    toggleMute: function () {
      global.SiteAudio.setMuted(!prefs.muted);
    },

    isMuted: function () {
      return prefs.muted;
    },

    setVolume: function (v) {
      prefs.volume = Math.max(0, Math.min(1, Number(v)));
      if (!prefs.muted) {
        audio.volume = prefs.volume;
      }
      savePrefs();
      dispatch("volumechange", { volume: prefs.volume });
    },

    getVolume: function () {
      return prefs.volume;
    },

    seek: function (t) {
      var d = audio.duration;
      if (!isNaN(d) && d > 0) {
        audio.currentTime = Math.max(0, Math.min(t, d));
      }
    },

    applyPrefsToElement: function () {
      prefs = loadPrefs();
      audio.volume = prefs.volume;
      audio.muted = prefs.muted;
    },
  };
})(typeof window !== "undefined" ? window : this);
