(function () {
  var LS_TRACK = "gruziaMusicTrackIndex";
  var CAT_ORDER = ["modern", "folk", "instrumental"];

  function flatTracks() {
    var out = [];
    var byCat = window.MUSIC_BY_CATEGORY || {};
    CAT_ORDER.forEach(function (cat) {
      var list = byCat[cat] || [];
      list.forEach(function (t) {
        if (!t || !t.file) return;
        out.push({
          category: cat,
          title: t.title,
          artist: t.artist || "",
          file: t.file,
          credit: t.credit || "",
        });
      });
    });
    return out;
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function saveTrackIndex(i) {
    try {
      localStorage.setItem(LS_TRACK, String(i));
    } catch (e) {
      /* ignore */
    }
  }

  function loadTrackIndex(max) {
    try {
      var n = parseInt(localStorage.getItem(LS_TRACK), 10);
      if (!isNaN(n) && n >= 0 && n < max) return n;
    } catch (e) {
      /* ignore */
    }
    return 0;
  }

  var tracks = flatTracks();
  if (!window.SiteAudio) return;

  var elNow = document.getElementById("music-now-title");
  var elCredit = document.getElementById("music-now-credit");
  var elPlay = document.getElementById("music-btn-play");
  var elPrev = document.getElementById("music-btn-prev");
  var elNext = document.getElementById("music-btn-next");
  var elMute = document.getElementById("music-btn-mute");
  var elVol = document.getElementById("music-volume");
  var elProgress = document.getElementById("music-progress");
  var elCur = document.getElementById("music-time-current");
  var elDur = document.getElementById("music-time-duration");
  var listRoot = document.getElementById("music-track-list");

  if (
    !listRoot ||
    !elPlay ||
    !elPrev ||
    !elNext ||
    !elProgress ||
    !elMute ||
    !elVol
  ) {
    return;
  }

  if (!tracks.length) {
    listRoot.innerHTML =
      '<p class="music-empty-cat">Нет локальных треков: добавьте MP3 в <code>audio/music/</code> и строки в <code>music-data.js</code>, либо запустите <code>tools/fetch_rustavi_choir.sh</code>, когда archive.org доступен.</p>';
    if (elNow) elNow.textContent = "—";
    return;
  }

  var currentIndex = loadTrackIndex(tracks.length);

  function trackAt(i) {
    return tracks[(i + tracks.length) % tracks.length];
  }

  function trackLabel(t) {
    return t.artist ? t.artist + " — " + t.title : t.title;
  }

  function highlightList() {
    listRoot.querySelectorAll(".music-track-row").forEach(function (row, j) {
      row.classList.toggle("is-active", j === currentIndex);
      row.setAttribute("aria-current", j === currentIndex ? "true" : "false");
    });
  }

  function updateChrome() {
    var t = trackAt(currentIndex);
    if (elNow) elNow.textContent = trackLabel(t);
    if (elCredit) elCredit.textContent = t.credit || "";
    highlightList();
    var playing =
      SiteAudio.getMode() === "music" &&
      !SiteAudio.getElement().paused &&
      SiteAudio.getElement().src &&
      new URL(SiteAudio.getElement().src, location.href).href ===
        new URL(t.file, location.href).href;
    if (elPlay) {
      elPlay.textContent = playing ? "\u23F8" : "\u25B6";
      elPlay.setAttribute("aria-label", playing ? "Пауза" : "Воспроизвести");
    }
    if (elMute) {
      elMute.textContent = SiteAudio.isMuted() ? "🔇" : "🔊";
      elMute.setAttribute(
        "aria-label",
        SiteAudio.isMuted() ? "Включить звук" : "Без звука"
      );
    }
    if (elVol) {
      elVol.value = String(Math.round(SiteAudio.getVolume() * 100));
    }
  }

  function playIndex(i, forceReload) {
    currentIndex = (i + tracks.length) % tracks.length;
    var t = trackAt(currentIndex);
    saveTrackIndex(currentIndex);
    var a = SiteAudio.getElement();
    var same =
      SiteAudio.getMode() === "music" &&
      a.src &&
      new URL(a.src, location.href).href === new URL(t.file, location.href).href;
    if (same && !forceReload) {
      if (a.paused) {
        a.play().catch(function () {});
      }
    } else {
      SiteAudio.playMusic(t.file, {
        title: trackLabel(t),
        category: t.category,
        credit: t.credit,
      });
    }
    updateChrome();
  }

  function togglePlay() {
    var t = trackAt(currentIndex);
    var a = SiteAudio.getElement();
    var same =
      SiteAudio.getMode() === "music" &&
      a.src &&
      new URL(a.src, location.href).href === new URL(t.file, location.href).href;
    if (same) {
      if (a.paused) {
        a.play().catch(function () {});
      } else {
        SiteAudio.pause();
      }
    } else {
      playIndex(currentIndex, true);
    }
    updateChrome();
  }

  function buildList() {
    var labels = window.MUSIC_CATEGORY_LABELS || {};
    var byCat = window.MUSIC_BY_CATEGORY || {};
    var flatI = 0;
    CAT_ORDER.forEach(function (cat) {
      var raw = byCat[cat] || [];
      var playable = raw.filter(function (t) {
        return t && t.file;
      });
      var section = document.createElement("section");
      section.className = "music-section";
      var h = document.createElement("h2");
      h.className = "music-section-title";
      h.textContent = labels[cat] || cat;
      section.appendChild(h);
      if (!playable.length) {
        var empty = document.createElement("p");
        empty.className = "music-empty-cat";
        empty.textContent =
          "Пока нет файлов с подходящей лицензией — добавьте MP3 вручную или пропустите.";
        section.appendChild(empty);
        listRoot.appendChild(section);
        return;
      }
      var ul = document.createElement("ul");
      ul.className = "music-tracks";
      playable.forEach(function (t) {
        var idx = flatI++;
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "music-track-row";
        btn.setAttribute("data-index", String(idx));
        var num = document.createElement("span");
        num.className = "music-track-num";
        num.textContent = String(idx + 1);
        var body = document.createElement("span");
        body.className = "music-track-body";
        var titleEl = document.createElement("span");
        titleEl.className = "music-track-title";
        titleEl.textContent = t.title;
        body.appendChild(titleEl);
        if (t.artist) {
          var art = document.createElement("div");
          art.className = "music-track-artist";
          art.textContent = t.artist;
          body.appendChild(art);
        }
        if (t.credit) {
          var cr = document.createElement("div");
          cr.className = "music-track-credit";
          cr.textContent = t.credit;
          body.appendChild(cr);
        }
        btn.appendChild(num);
        btn.appendChild(body);
        btn.addEventListener("click", function () {
          playIndex(idx, true);
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      section.appendChild(ul);
      listRoot.appendChild(section);
    });
  }

  SiteAudio.applyPrefsToElement();

  buildList();
  highlightList();
  updateChrome();

  elPlay.addEventListener("click", function () {
    togglePlay();
  });
  elPrev.addEventListener("click", function () {
    playIndex(currentIndex - 1, true);
  });
  elNext.addEventListener("click", function () {
    playIndex(currentIndex + 1, true);
  });

  elMute.addEventListener("click", function () {
    SiteAudio.toggleMute();
    updateChrome();
  });

  elVol.addEventListener("input", function () {
    var v = parseInt(elVol.value, 10);
    if (isNaN(v)) return;
    SiteAudio.setVolume(v / 100);
    if (v > 0 && SiteAudio.isMuted()) {
      SiteAudio.setMuted(false);
    }
    updateChrome();
  });

  var progressDragging = false;
  elProgress.addEventListener("input", function () {
    progressDragging = true;
    var a = SiteAudio.getElement();
    var d = a.duration;
    if (isFinite(d) && d > 0) {
      SiteAudio.seek((parseFloat(elProgress.value) / 1000) * d);
    }
  });
  elProgress.addEventListener("change", function () {
    progressDragging = false;
  });

  SiteAudio.subscribe(function (ev) {
    if (ev === "ended") {
      if (SiteAudio.getMode() === "music") {
        playIndex(currentIndex + 1, true);
      }
      return;
    }
    if (ev === "timeupdate" && !progressDragging) {
      var a = SiteAudio.getElement();
      var d = a.duration;
      var c = a.currentTime;
      if (elCur) elCur.textContent = formatTime(c);
      if (elDur) elDur.textContent = formatTime(d);
      if (elProgress) {
        if (isFinite(d) && d > 0) {
          elProgress.value = String(Math.round((c / d) * 1000));
        } else {
          elProgress.value = "0";
        }
      }
      return;
    }
    updateChrome();
  });
})();
