(function () {
  "use strict";

  var STORAGE_KEY = "gruziaChallengeV1";
  var levels = window.CHALLENGE_LEVELS || [];
  var quests = window.CHALLENGE_QUESTS || [];
  var legend = window.CHALLENGE_LEGEND || { minXp: 800, minQuests: 25 };
  var maxXp = window.CHALLENGE_MAX_XP || 1430;

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { done: [], lastLevel: 1, legendShown: false };
      var p = JSON.parse(raw);
      return {
        done: Array.isArray(p.done) ? p.done : [],
        lastLevel: typeof p.lastLevel === "number" ? p.lastLevel : 1,
        legendShown: !!p.legendShown,
      };
    } catch (e) {
      return { done: [], lastLevel: 1, legendShown: false };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          done: state.done,
          lastLevel: state.lastLevel,
          legendShown: state.legendShown,
        })
      );
    } catch (e) {}
  }

  function getLevelFromXp(xp) {
    var i;
    for (i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].minXp) return levels[i].id;
    }
    return 1;
  }

  function computeXp(doneIds) {
    var set = {};
    var i;
    for (i = 0; i < doneIds.length; i++) set[doneIds[i]] = true;
    var total = 0;
    for (i = 0; i < quests.length; i++) {
      if (set[quests[i].id]) total += quests[i].xp;
    }
    return total;
  }

  function confettiBurst() {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = window.innerWidth);
    var h = (canvas.height = window.innerHeight);
    var colors = ["#c9a227", "#e85d4c", "#2d6a4f", "#ffffff", "#1a1a2e", "#b8860b"];
    var pieces = [];
    var n = 120;
    var i;
    for (i = 0; i < n; i++) {
      pieces.push({
        x: Math.random() * w,
        y: Math.random() * -h * 0.5,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        r: Math.random() * 6 + 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        c: colors[(Math.random() * colors.length) | 0],
      });
    }
    var tPrev = performance.now();
    var tStart = tPrev;
    function frame(t) {
      var dt = Math.min((t - tPrev) / 16, 4);
      tPrev = t;
      ctx.clearRect(0, 0, w, h);
      var alive = false;
      for (i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        if (p.y > h + 20) continue;
        alive = true;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.15 * dt;
        p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      }
      if (alive && t - tStart < 3200) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  function el(id) {
    return document.getElementById(id);
  }

  function renderBadges(currentLevel) {
    var wrap = el("challenge-badges");
    if (!wrap) return;
    wrap.innerHTML = "";
    var i;
    for (i = 0; i < levels.length; i++) {
      var L = levels[i];
      var unlocked = currentLevel >= L.id;
      var isCurrent = currentLevel === L.id;
      var badge = document.createElement("div");
      badge.className = "challenge-badge" + (unlocked ? " is-unlocked" : "");
      if (isCurrent) badge.className += " is-current";
      badge.innerHTML =
        '<span class="challenge-badge-emoji">' +
        L.emoji +
        "</span>" +
        '<span class="challenge-badge-title">Ур. ' +
        L.id +
        "</span>" +
        '<span class="challenge-badge-name">' +
        L.title +
        "</span>";
      wrap.appendChild(badge);
    }
  }

  function updateHud(state) {
    var xp = computeXp(state.done);
    var lvl = getLevelFromXp(xp);
    var completed = state.done.length;
    var qualifiesEarly =
      xp >= legend.minXp && completed >= legend.minQuests;

    if (lvl < state.lastLevel) {
      state.lastLevel = lvl;
      saveState(state);
    }
    if (!qualifiesEarly && state.legendShown) {
      state.legendShown = false;
      saveState(state);
    }

    var tier = levels[lvl - 1] || levels[0];
    var nextTier = levels[lvl];
    var barFill = el("challenge-xp-bar-fill");
    var barLabel = el("challenge-xp-label");
    var levelTitle = el("challenge-level-title");
    var stats = el("challenge-stats");

    if (barFill) {
      var pct = Math.min(100, (xp / maxXp) * 100);
      barFill.style.width = pct + "%";
      var bar = barFill.parentElement;
      if (bar && bar.getAttribute("role") === "progressbar") {
        bar.setAttribute("aria-valuenow", String(Math.round(xp)));
        bar.setAttribute("aria-valuemax", String(maxXp));
      }
    }
    if (barLabel) {
      barLabel.textContent = xp + " / " + maxXp + " XP";
    }
    if (levelTitle) {
      levelTitle.innerHTML =
        '<span class="challenge-level-emoji">' +
        tier.emoji +
        "</span> " +
        tier.title +
        " <span class=\"challenge-level-num\">(уровень " +
        lvl +
        " из " +
        levels.length +
        ")</span>";
    }
    if (stats) {
      var toNext = "";
      if (lvl >= levels.length) {
        toNext = " · Максимальный уровень!";
      } else if (nextTier && nextTier.minXp !== Infinity) {
        toNext = " · До следующего уровня: " + Math.max(0, nextTier.minXp - xp) + " XP";
      }
      stats.textContent =
        "Выполнено квестов: " + completed + " из " + quests.length + toNext;
    }

    renderBadges(lvl);

    var legendCard = el("challenge-legend-card");
    var qualifies = qualifiesEarly;
    if (legendCard) {
      legendCard.hidden = !qualifies;
      if (qualifies && !state.legendShown) {
        state.legendShown = true;
        saveState(state);
        confettiBurst();
      }
    }

    if (lvl > state.lastLevel) {
      confettiBurst();
      state.lastLevel = lvl;
      saveState(state);
    }
  }

  function toggleQuest(questId, state) {
    var idx = state.done.indexOf(questId);
    if (idx >= 0) state.done.splice(idx, 1);
    else state.done.push(questId);
    saveState(state);
    updateHud(state);
  }

  function buildList(state) {
    var root = el("challenge-quest-list");
    if (!root) return;
    root.innerHTML = "";
    var byLevel = {};
    var i;
    for (i = 0; i < quests.length; i++) {
      var q = quests[i];
      if (!byLevel[q.level]) byLevel[q.level] = [];
      byLevel[q.level].push(q);
    }
    var levelOrder = [1, 2, 3, 4, 5];
    for (i = 0; i < levelOrder.length; i++) {
      var L = levelOrder[i];
      var list = byLevel[L];
      if (!list || !list.length) continue;
      var tier = levels[L - 1];
      var section = document.createElement("section");
      section.className = "challenge-section";
      var h2 = document.createElement("h2");
      h2.className = "challenge-section-title";
      h2.innerHTML =
        (tier ? tier.emoji + " " : "") +
        "Уровень " +
        L +
        " — " +
        (tier ? tier.title : "");
      section.appendChild(h2);
      var ul = document.createElement("ul");
      ul.className = "challenge-quest-ul";
      var j;
      for (j = 0; j < list.length; j++) {
        var q = list[j];
        var li = document.createElement("li");
        li.className = "challenge-quest-item";
        var checked = state.done.indexOf(q.id) >= 0;
        var desc =
          q.description &&
          '<span class="challenge-quest-desc">' +
            escHtml(q.description) +
            "</span>";
        li.innerHTML =
          '<label class="challenge-quest-label">' +
          '<input type="checkbox" class="challenge-quest-cb" data-id="' +
          escHtml(q.id) +
          '" ' +
          (checked ? "checked" : "") +
          " />" +
          '<span class="challenge-quest-emoji" aria-hidden="true">' +
          q.emoji +
          "</span>" +
          '<span class="challenge-quest-body">' +
          '<span class="challenge-quest-title">' +
          escHtml(q.title) +
          "</span>" +
          (desc || "") +
          "</span>" +
          '<span class="challenge-quest-xp">+' +
          q.xp +
          " XP</span>" +
          "</label>";
        ul.appendChild(li);
      }
      section.appendChild(ul);
      root.appendChild(section);
    }
  }

  function initReset(state) {
    var btn = el("challenge-reset");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!confirm("Сбросить весь прогресс челленджа?")) return;
      state.done = [];
      state.lastLevel = 1;
      state.legendShown = false;
      saveState(state);
      buildList(state);
      updateHud(state);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var state = loadState();
    var root = el("challenge-quest-list");
    if (root) {
      root.addEventListener("change", function (e) {
        var t = e.target;
        if (!t || !t.classList || !t.classList.contains("challenge-quest-cb")) return;
        var id = t.getAttribute("data-id");
        if (!id) return;
        toggleQuest(id, state);
      });
    }
    buildList(state);
    updateHud(state);
    initReset(state);
  });
})();
