(function () {
  "use strict";

  var CANVAS_W = 800, CANVAS_H = 300;
  // GROUND_Y is the feet baseline: the y-coordinate where a standing/jumping
  // player's feet rest, and where ground-obstacle bottoms sit. Everything
  // else (sprite draw position, hitboxes, hanging-obstacle clearance) is
  // derived from it so the geometry stays consistent.
  var GROUND_Y = 230;
  var STAND_H = 62;
  var DUCK_H = 30;
  // Per-frame (not per-second) values, tuned for ~60fps requestAnimationFrame
  // ticks: JUMP_VELOCITY is the initial upward speed in px/frame, GRAVITY the
  // downward acceleration added each frame. Total airtime = 2*|JUMP_VELOCITY|/GRAVITY.
  var GRAVITY = 0.55;
  var JUMP_VELOCITY = -10;
  var BASE_SPEED = 4.2;

  var canvas, ctx;
  var state = "select"; // select | playing | quiz | gameover
  var selectedClass = null;
  var sprites = {};
  var imagesLoaded = 0, imagesTotal = 0;

  var CLASSES = [
    { id: "network", label: "Network Engineer", tool: "Ethernet cable", color: "#5ab4f0", sheet: "/img/game/sprite-network.png" },
    { id: "security", label: "Network Security Engineer", tool: "Firewall shield", color: "#eb5757", sheet: "/img/game/sprite-security.png" },
    { id: "devops", label: "Network DevOps Engineer", tool: "Automation wrench", color: "#8cd296", sheet: "/img/game/sprite-devops.png" }
  ];

  var QUIZ_SCORE_INTERVAL = 160;
  var QUIZ_BONUS = 50;

  var QUESTION_BANKS = {
    network: [
      { q: "Which protocol does traceroute commonly rely on to map a packet's path?", options: ["ICMP", "FTP", "SNMP", "SMTP"], correct: 0 },
      { q: "What is the default administrative distance of OSPF?", options: ["90", "100", "110", "120"], correct: 2 },
      { q: "Which VLAN carries untagged traffic on a trunk by default?", options: ["VLAN 1", "VLAN 10", "VLAN 100", "VLAN 999"], correct: 0 },
      { q: "What does ARP resolve?", options: ["IP address to MAC address", "MAC address to IP address", "Hostname to IP address", "Port to service"], correct: 0 },
      { q: "Which of these is a Layer 3 device?", options: ["Switch", "Hub", "Router", "Repeater"], correct: 2 },
      { q: "What is the main purpose of BGP's AS_PATH attribute?", options: ["Loop prevention between autonomous systems", "Encrypting routing updates", "Load balancing MAC addresses", "DNS resolution"], correct: 0 },
      { q: "In EVPN-VXLAN, what does VTEP stand for?", options: ["VXLAN Tunnel End Point", "Virtual Trunking Ethernet Protocol", "VLAN Trunk Endpoint Path", "Virtual Topology Exchange Point"], correct: 0 },
      { q: "Which port does HTTPS use by default?", options: ["80", "443", "22", "3389"], correct: 1 }
    ],
    security: [
      { q: "What does a stateful firewall track that a stateless one doesn't?", options: ["Connection/session state", "Packet size only", "DNS queries only", "Source IP only"], correct: 0 },
      { q: "What's the primary purpose of a DMZ in network design?", options: ["Isolate public-facing services from the internal network", "Increase VLAN count", "Encrypt all traffic", "Speed up routing"], correct: 0 },
      { q: "Which best describes a zero-day vulnerability?", options: ["A flaw unknown to the vendor with no patch yet available", "A bug fixed on release day", "A vulnerability only affecting new deployments", "A fully patched CVE"], correct: 0 },
      { q: "What does CVSS attempt to measure?", options: ["Severity of a vulnerability", "Number of CVEs per vendor", "Patch release schedule", "Network bandwidth usage"], correct: 0 },
      { q: "Which protocol is commonly exploited in a man-in-the-middle spoofing attack on a LAN?", options: ["ARP", "BGP", "OSPF", "NTP"], correct: 0 },
      { q: "What is the principle of least privilege?", options: ["Granting only the access needed to perform a task", "Giving all users admin rights", "Encrypting least-used data", "Disabling all firewall rules"], correct: 0 },
      { q: "What does IDS stand for?", options: ["Intrusion Detection System", "Internet Data Security", "Internal Defense Server", "Identity Directory Service"], correct: 0 },
      { q: "What's a common mitigation for an exposed management interface?", options: ["Restrict access to a dedicated management network", "Expose it on every interface for visibility", "Disable all logging", "Use default credentials for simplicity"], correct: 0 }
    ],
    devops: [
      { q: "What does IaC stand for?", options: ["Infrastructure as Code", "Internet Access Control", "Interface as Component", "Integrated Automation Client"], correct: 0 },
      { q: "In Ansible, what file commonly defines the hosts a playbook runs against?", options: ["Inventory file", "Dockerfile", "Vagrantfile", "Procfile"], correct: 0 },
      { q: "What's the main benefit of a CI/CD pipeline for network changes?", options: ["Automatically testing and deploying changes consistently", "Manually logging into each device", "Replacing version control", "Eliminating the need for testing"], correct: 0 },
      { q: "What does 'idempotent' mean for an automation task?", options: ["Running it multiple times produces the same result", "It only runs once, ever", "It requires root access", "It can't be version controlled"], correct: 0 },
      { q: "Which tool is standard for version-controlling network configuration changes?", options: ["Git", "FTP", "Telnet", "SNMP"], correct: 0 },
      { q: "What's a common use of Jinja2 templating in network automation?", options: ["Generating device configs from variables", "Encrypting SSH sessions", "Replacing BGP", "Monitoring CPU usage only"], correct: 0 },
      { q: "What does AAP commonly refer to in Red Hat's automation ecosystem?", options: ["Ansible Automation Platform", "Automated Access Point", "Application Access Protocol", "Advanced Automation Pipeline"], correct: 0 },
      { q: "What's a key goal of NetDevOps?", options: ["Applying software development practices to network operations", "Removing all human oversight", "Replacing routers with servers", "Avoiding version control"], correct: 0 }
    ]
  };

  var OBSTACLE_TYPES = [
    { id: "rack", kind: "ground", img: "/img/game/obstacle-rack.png", w: 32, h: 56, label: "Server Rack" },
    { id: "bug", kind: "ground", img: "/img/game/obstacle-bug.png", w: 40, h: 32, label: "CVE" },
    { id: "spike", kind: "ground", img: "/img/game/obstacle-spike.png", w: 28, h: 48, label: "Latency Spike" },
    { id: "cable", kind: "hanging", img: "/img/game/obstacle-cable.png", w: 48, h: 40, label: "Low-Hanging Cable" }
  ];

  var player, obstacles, collectibles, score, highScore, speed, spawnTimer, nextSpawnIn, elapsedFrames;
  var nextQuizScore, askedQuestionIndexes, currentQuiz, quizFeedback;

  function loadImage(src) {
    imagesTotal++;
    var img = new Image();
    img.onload = function () { imagesLoaded++; };
    img.onerror = function () { imagesLoaded++; };
    img.src = src;
    return img;
  }

  function preload() {
    CLASSES.forEach(function (c) { sprites[c.id] = loadImage(c.sheet); });
    OBSTACLE_TYPES.forEach(function (o) { sprites[o.id] = loadImage(o.img); });
    sprites.packet = loadImage("/img/game/collectible-packet.png");
  }

  function getHighScore() {
    try {
      var v = window.localStorage.getItem("nej_highscore");
      return v ? parseInt(v, 10) : 0;
    } catch (e) { return 0; }
  }

  function setHighScore(v) {
    try { window.localStorage.setItem("nej_highscore", String(v)); } catch (e) {}
  }

  function resetGame() {
    player = {
      x: 90,
      y: GROUND_Y,
      vy: 0,
      w: 48, h: STAND_H,
      ducking: false,
      onGround: true,
      frame: 0,
      frameTimer: 0
    };
    obstacles = [];
    collectibles = [];
    score = 0;
    speed = BASE_SPEED;
    spawnTimer = 0;
    nextSpawnIn = 70;
    elapsedFrames = 0;
    highScore = getHighScore();
    nextQuizScore = QUIZ_SCORE_INTERVAL;
    askedQuestionIndexes = [];
    currentQuiz = null;
    quizFeedback = null;
    var quizWrap = document.getElementById("nej-quiz");
    if (quizWrap) quizWrap.style.display = "none";
  }

  function pickQuizQuestion() {
    var bank = QUESTION_BANKS[selectedClass] || [];
    if (bank.length === 0) return null;
    if (askedQuestionIndexes.length >= bank.length) askedQuestionIndexes = [];
    var available = [];
    for (var i = 0; i < bank.length; i++) {
      if (askedQuestionIndexes.indexOf(i) === -1) available.push(i);
    }
    var idx = available[Math.floor(Math.random() * available.length)];
    askedQuestionIndexes.push(idx);
    return { index: idx, data: bank[idx] };
  }

  function triggerQuiz() {
    var picked = pickQuizQuestion();
    if (!picked) return;
    currentQuiz = picked;
    quizFeedback = null;
    state = "quiz";
    renderQuizUI();
  }

  function renderQuizUI() {
    var wrap = document.getElementById("nej-quiz");
    if (!wrap || !currentQuiz) return;
    var q = currentQuiz.data;
    var html = '<div class="nej-quiz-q">' + q.q + '</div><div class="nej-quiz-options">';
    q.options.forEach(function (opt, i) {
      html += '<button class="nej-quiz-opt" data-i="' + i + '">' + opt + '</button>';
    });
    html += '</div><div class="nej-quiz-feedback" id="nej-quiz-feedback"></div>';
    wrap.innerHTML = html;
    wrap.style.display = "flex";
    Array.prototype.forEach.call(wrap.querySelectorAll(".nej-quiz-opt"), function (btn) {
      btn.addEventListener("click", function () {
        answerQuiz(parseInt(btn.getAttribute("data-i"), 10));
      });
    });
  }

  function answerQuiz(choiceIndex) {
    if (state !== "quiz" || !currentQuiz) return;
    var correct = choiceIndex === currentQuiz.data.correct;
    var feedbackEl = document.getElementById("nej-quiz-feedback");
    Array.prototype.forEach.call(document.querySelectorAll(".nej-quiz-opt"), function (btn) {
      btn.disabled = true;
      var i = parseInt(btn.getAttribute("data-i"), 10);
      if (i === currentQuiz.data.correct) btn.classList.add("nej-correct");
      else if (i === choiceIndex) btn.classList.add("nej-incorrect");
    });
    if (correct) {
      score += QUIZ_BONUS;
      if (feedbackEl) feedbackEl.textContent = "Correct! +" + QUIZ_BONUS + " points.";
    } else if (feedbackEl) {
      feedbackEl.textContent = "Not quite — back to the run.";
    }
    setTimeout(function () {
      var wrap = document.getElementById("nej-quiz");
      if (wrap) wrap.style.display = "none";
      currentQuiz = null;
      nextQuizScore = Math.floor(score) + QUIZ_SCORE_INTERVAL;
      if (state === "quiz") state = "playing";
    }, 1200);
  }

  function startGame(classId) {
    selectedClass = classId;
    resetGame();
    state = "playing";
  }

  function jump() {
    if (state !== "playing") return;
    if (player.onGround && !player.ducking) {
      player.vy = JUMP_VELOCITY;
      player.onGround = false;
    }
  }

  function setDuck(v) {
    if (state !== "playing") return;
    player.ducking = v && player.onGround;
  }

  function spawnObstacleOrCollectible() {
    var r = Math.random();
    if (r < 0.22) {
      var cy = GROUND_Y - 90 - Math.random() * 40;
      collectibles.push({ x: CANVAS_W + 20, y: cy, w: 18, h: 18 });
      return;
    }
    var type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    var ob = { type: type, x: CANVAS_W + 10, w: type.w, h: type.h };
    if (type.kind === "hanging") {
      // Bottom edge must sit between the duck-hitbox top and the
      // standing-hitbox top, so ducking clears it but standing doesn't.
      var bottom = GROUND_Y - DUCK_H - 8;
      ob.y = bottom - type.h;
    } else {
      ob.y = GROUND_Y - type.h;
    }
    obstacles.push(ob);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerHitbox() {
    if (player.ducking) {
      return { x: player.x + 6, y: player.y - DUCK_H, w: player.w - 12, h: DUCK_H };
    }
    return { x: player.x + 8, y: player.y - player.h, w: player.w - 16, h: player.h };
  }

  function update() {
    if (state !== "playing") return;
    elapsedFrames++;
    speed = BASE_SPEED + Math.min(elapsedFrames / 900, 1) * 3.5;
    score += speed * 0.045;

    if (score >= nextQuizScore) {
      triggerQuiz();
      return;
    }

    // physics
    if (!player.onGround) {
      player.vy += GRAVITY;
      player.y += player.vy;
      if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.vy = 0;
        player.onGround = true;
      }
    }

    player.frameTimer++;
    if (player.frameTimer > 7) {
      player.frameTimer = 0;
      player.frame = player.frame === 0 ? 1 : 0;
    }

    // spawn
    spawnTimer++;
    if (spawnTimer >= nextSpawnIn) {
      spawnObstacleOrCollectible();
      spawnTimer = 0;
      nextSpawnIn = Math.max(42, 85 - elapsedFrames / 40);
    }

    // move + collide obstacles
    var hb = playerHitbox();
    for (var i = obstacles.length - 1; i >= 0; i--) {
      var ob = obstacles[i];
      ob.x -= speed;
      if (ob.x + ob.w < -10) { obstacles.splice(i, 1); continue; }
      var obRect = { x: ob.x, y: ob.y, w: ob.w, h: ob.h };
      if (rectsOverlap(hb, obRect)) {
        endGame();
        return;
      }
    }

    for (var j = collectibles.length - 1; j >= 0; j--) {
      var c = collectibles[j];
      c.x -= speed;
      if (c.x + c.w < -10) { collectibles.splice(j, 1); continue; }
      if (rectsOverlap(hb, c)) {
        score += 25;
        collectibles.splice(j, 1);
      }
    }
  }

  function endGame() {
    state = "gameover";
    var finalScore = Math.floor(score);
    if (finalScore > highScore) {
      highScore = finalScore;
      setHighScore(highScore);
    }
  }

  function drawBackground() {
    ctx.fillStyle = "#12141a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    var gridOffset = (elapsedFrames * (state === "playing" ? speed : 0)) % 48;
    for (var x = -48; x < CANVAS_W + 48; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x - gridOffset, 0);
      ctx.lineTo(x - gridOffset, CANVAS_H);
      ctx.stroke();
    }
    ctx.fillStyle = "#1b1e26";
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    ctx.fillStyle = "#eb5757";
    ctx.fillRect(0, GROUND_Y, CANVAS_W, 3);
  }

  function drawSprite(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  function drawPlayer() {
    var sheet = sprites[selectedClass];
    if (!sheet) return;
    var frameW = sheet.naturalWidth ? sheet.naturalWidth / 4 : 112;
    var frameH = sheet.naturalHeight || 144;
    var frameIndex = player.ducking ? 3 : (!player.onGround ? 2 : player.frame);
    var dw = player.w, dh = player.h;
    var displayH = player.ducking ? DUCK_H : dh;
    var dy = player.y - displayH;
    drawSprite(sheet, frameIndex * frameW, 0, frameW, frameH, player.x, dy, dw, displayH);
  }

  function drawObstacles() {
    obstacles.forEach(function (ob) {
      var img = sprites[ob.type.id];
      drawSprite(img, 0, 0, img ? img.naturalWidth : ob.w, img ? img.naturalHeight : ob.h, ob.x, ob.y, ob.w, ob.h);
    });
  }

  function drawCollectibles() {
    var img = sprites.packet;
    collectibles.forEach(function (c) {
      drawSprite(img, 0, 0, img ? img.naturalWidth : c.w, img ? img.naturalHeight : c.h, c.x, c.y, c.w, c.h);
    });
  }

  function drawHUD() {
    ctx.fillStyle = "#e8e8ec";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "left";
    ctx.fillText("SCORE " + Math.floor(score), 16, 28);
    ctx.textAlign = "right";
    ctx.fillStyle = "#9aa0ad";
    ctx.fillText("BEST " + highScore, CANVAS_W - 16, 28);
    ctx.textAlign = "left";
  }

  function drawOverlayBox(lines) {
    ctx.fillStyle = "rgba(10, 11, 15, 0.72)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#e8e8ec";
    ctx.textAlign = "center";
    var y = CANVAS_H / 2 - (lines.length - 1) * 14;
    lines.forEach(function (line) {
      ctx.font = line.bold ? "bold 24px monospace" : "16px monospace";
      ctx.fillStyle = line.color || "#e8e8ec";
      ctx.fillText(line.text, CANVAS_W / 2, y);
      y += 32;
    });
    ctx.textAlign = "left";
  }

  function render() {
    drawBackground();
    if (state === "playing" || state === "gameover" || state === "quiz") {
      drawObstacles();
      drawCollectibles();
      drawPlayer();
      drawHUD();
    }
    if (state === "quiz") {
      ctx.fillStyle = "rgba(10, 11, 15, 0.55)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    if (state === "gameover") {
      drawOverlayBox([
        { text: "CONNECTION LOST", bold: true, color: "#eb5757" },
        { text: "Score: " + Math.floor(score) + "   Best: " + highScore },
        { text: "Press Space / tap Jump to retry" }
      ]);
    }
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  function handlePrimary() {
    if (state === "gameover") {
      resetGame();
      state = "playing";
    } else if (state === "playing") {
      jump();
    }
  }

  function initControls() {
    window.addEventListener("keydown", function (e) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handlePrimary();
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setDuck(true);
      }
    });
    window.addEventListener("keyup", function (e) {
      if (e.code === "ArrowDown") setDuck(false);
    });

    var jumpBtn = document.getElementById("nej-btn-jump");
    var duckBtn = document.getElementById("nej-btn-duck");
    if (jumpBtn) {
      jumpBtn.addEventListener("touchstart", function (e) { e.preventDefault(); handlePrimary(); }, { passive: false });
      jumpBtn.addEventListener("mousedown", function () { handlePrimary(); });
    }
    if (duckBtn) {
      duckBtn.addEventListener("touchstart", function (e) { e.preventDefault(); setDuck(true); }, { passive: false });
      duckBtn.addEventListener("touchend", function (e) { e.preventDefault(); setDuck(false); }, { passive: false });
      duckBtn.addEventListener("mousedown", function () { setDuck(true); });
      duckBtn.addEventListener("mouseup", function () { setDuck(false); });
    }
    canvas.addEventListener("click", function () {
      if (state === "select") return;
      handlePrimary();
    });
  }

  function initClassSelect() {
    var container = document.getElementById("nej-class-select");
    if (!container) return;
    CLASSES.forEach(function (c) {
      var btn = document.createElement("button");
      btn.className = "nej-class-btn";
      btn.style.borderColor = c.color;
      btn.innerHTML = '<span class="nej-class-dot" style="background:' + c.color + '"></span>' +
        '<span class="nej-class-name">' + c.label + '</span>' +
        '<span class="nej-class-tool">' + c.tool + '</span>';
      btn.addEventListener("click", function () {
        container.style.display = "none";
        canvas.style.display = "block";
        document.getElementById("nej-controls").style.display = "flex";
        startGame(c.id);
      });
      container.appendChild(btn);
    });
  }

  function init() {
    canvas = document.getElementById("nej-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    canvas.style.display = "none";
    highScore = getHighScore();
    var bestEl = document.getElementById("nej-best-preview");
    if (bestEl) bestEl.textContent = highScore;
    preload();
    initClassSelect();
    initControls();
    requestAnimationFrame(loop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
