// Game State
let players = [];
let gamePhase = 'SETUP'; // SETUP, NIGHT, DAY
let time = 300; // 5 minutes default
let timerInterval = null;

// Configurable Roles (Thai Translations)
const ROLES_CONFIG = [
    { id: 'werewolf', name: 'มนุษย์หมาป่า (Werewolf)', icon: 'fa-wolf-pack-battalion', desc: 'ตื่นขึ้นมาตอนกลางคืนเพื่อเลือกเหยื่อสังหาร', nightOrder: 10, team: 'WOLF' },
    { id: 'minion', name: 'สมุนรับใช้ (Minion)', icon: 'fa-mask', desc: 'รู้ว่าใครเป็นหมาป่า แต่ไม่ใช่หมาป่า', nightOrder: 5, team: 'WOLF' },
    { id: 'seer', name: 'ผู้หยั่งรู้ (Seer)', icon: 'fa-eye', desc: 'ตื่นมาเพื่อดูบทบาทของคนอื่นได้คืนละ 1 คน', nightOrder: 20, team: 'VILLAGER' },
    { id: 'doctor', name: 'หมอ (Doctor)', icon: 'fa-user-md', desc: 'เลือกช่วยชีวิตคนได้คืนละ 1 คน', nightOrder: 30, team: 'VILLAGER' },
    { id: 'witch', name: 'แม่มด (Witch)', icon: 'fa-hat-wizard', desc: 'มียาพิษ 1 ขวด และยาชุบชีวิต 1 ขวด', nightOrder: 40, team: 'VILLAGER' },
    { id: 'mage', name: 'นักเวทย์ (Mage)', icon: 'fa-wand-magic-sparkles', desc: 'สามารถสาปให้คนเงียบได้', nightOrder: 50, team: 'VILLAGER' },
    { id: 'insomniac', name: 'คนนอนไม่หลับ (Insomniac)', icon: 'fa-bed', desc: 'ตื่นตอนจบเพื่อดูว่าตัวเองโดนเปลี่ยนไหม', nightOrder: 90, team: 'VILLAGER' },
    { id: 'villager', name: 'ชาวบ้าน (Villager)', icon: 'fa-user', desc: 'ไม่มีพลังพิเศษ ช่วยกันจับผิดในตอนกลางวัน', nightOrder: 0, team: 'VILLAGER' },
    { id: 'hunter', name: 'นายพราน (Hunter)', icon: 'fa-crosshairs', desc: 'ถ้าตาย สามารถเลือกยิงคนที่เหลือได้ 1 คน', nightOrder: 0, team: 'VILLAGER' },
    { id: 'beggar', name: 'ยาจก (Beggar)', icon: 'fa-hand-holding-dollar', desc: 'ยาจกชนะเมื่อถูกโหวตไห้ออกจากหมู่บ้าน', nightOrder: 0, team: 'NEUTRAL' },
    { id: 'cub', name: 'ลูกหมา (Wolf Cub)', icon: 'fa-paw', desc: 'ถ้าลูกหมาตาย คืนถัดไปหมาป่าจะฆ่าได้ 2 คน', nightOrder: 0, team: 'WOLF' },
    { id: 'bodyguard', name: 'บอดี้การ์ด (Bodyguard)', icon: 'fa-shield-halved', desc: 'เลือกปกป้องคนได้ 1 คน ห้ามซ้ำคนเดิม', nightOrder: 25, team: 'VILLAGER' },
    // Deluxe Edition Roles
    { id: 'huntress', name: 'พรานหญิง (Huntress)', icon: 'fa-person-rifle', desc: 'ห้ามถูกหมาป่าฆ่าในตอนกลางคืน', nightOrder: 0, team: 'VILLAGER' },
    { id: 'tough_guy', name: 'คนถึก (Tough Guy)', icon: 'fa-dumbbell', desc: 'ทนการโจมตีได้ 1 คืน แล้วจะตายในคืนถัดไป', nightOrder: 0, team: 'VILLAGER' },
    { id: 'prince', name: 'เจ้าชาย (Prince)', icon: 'fa-crown', desc: 'ไม่สามารถถูกโหวตออกจากหมู่บ้านได้', nightOrder: 0, team: 'VILLAGER' },
    { id: 'cupid', name: 'กามเทพ (Cupid)', icon: 'fa-heart', desc: 'เลือกคู่รัก 2 คนให้ผูกชีวิตกัน', nightOrder: 3, team: 'VILLAGER' },
    { id: 'serial_killer', name: 'ฆาตกร (Serial Killer)', icon: 'fa-skull-crossbones', desc: 'ฆ่าคนได้คืนละ 1 คน ชนะเมื่อเหลือคนเดียว', nightOrder: 45, team: 'NEUTRAL' },
    { id: 'fool', name: 'คนบ้า (Fool)', icon: 'fa-face-dizzy', desc: 'ถ้าถูกโหวตออก จะเปิดเผยบทบาทแต่ไม่ตาย', nightOrder: 0, team: 'VILLAGER' },
    // More Deluxe
    { id: 'cursed', name: 'คนที่ถูกสาป (Cursed)', icon: 'fa-book-skull', desc: 'ถ้าหมาป่ากัด จะไม่ตายแต่เปลี่ยนเป็นฝ่ายหมาป่า', nightOrder: 0, team: 'VILLAGER' },
    { id: 'sorcerer', name: 'พ่อมด (Sorcerer)', icon: 'fa-hat-witch', desc: 'ฝ่ายหมาป่า แต่ผู้หยั่งรู้จะเห็นเป็นชาวบ้าน ตื่นมาหาผู้หยั่งรู้', nightOrder: 15, team: 'WOLF' },
    { id: 'apprentice_seer', name: 'ศิษย์ผู้หยั่งรู้ (Apprentice Seer)', icon: 'fa-graduation-cap', desc: 'ถ้าผู้หยั่งรู้ตาย จะเลื่อนขั้นเป็นผู้หยั่งรู้แทน', nightOrder: 0, team: 'VILLAGER' },
    { id: 'lycan', name: 'ไลแคน (Lycan)', icon: 'fa-dog', desc: 'ฝ่ายชาวบ้าน แต่ผู้หยั่งรู้จะเห็นเป็นหมาป่า', nightOrder: 0, team: 'VILLAGER' },
    { id: 'mason', name: 'ช่างก่อสร้าง (Mason)', icon: 'fa-trowel-bricks', desc: 'ตื่นคืนแรกเพื่อรู้จักกับช่างก่อสร้างคนอื่น', nightOrder: 2, team: 'VILLAGER' },
    { id: 'ghost', name: 'ผี (Ghost)', icon: 'fa-ghost', desc: 'ตายในคืนแรกเสมอ แต่เขียนข้อความจากนรกได้', nightOrder: 0, team: 'VILLAGER' },
    // Extreme Roles
    { id: 'wolf_man', name: 'ลูกครึ่งหมาป่า (Wolf Man)', icon: 'fa-people-arrows', desc: 'ฝ่ายหมาป่า แต่ผู้หยั่งรู้เห็นเป็นชาวบ้าน', nightOrder: 10, team: 'WOLF' },
    { id: 'vampire_elder', name: 'แม่เฒ่าแวมไพร์ (Vampire Elder)', icon: 'fa-user-nurse', desc: 'หัวหน้าแวมไพร์ หมาป่าฆ่าไม่ได้', nightOrder: 60, team: 'VAMPIRE' },
    { id: 'old_hag', name: 'แม่เฒ่าสาปแช่ง (Old Hag)', icon: 'fa-khanda', desc: 'เลือกสาปให้คนออกจากหมู่บ้าน 1 คืน (ห้ามพูด/โหวต)', nightOrder: 5, team: 'VILLAGER' },
    { id: 'big_bad_wolf', name: 'หมาป่าจอมโหด (Big Bad Wolf)', icon: 'fa-shrimp', desc: 'ฆ่าคนได้ 2 คนต่อคืน (หรือมีความสามารถพิเศษ)', nightOrder: 11, team: 'WOLF' },
    { id: 'dire_wolf', name: 'หมาป่าทมิฬ (Dire Wolf)', icon: 'fa-link', desc: 'เลือกผูกจิตกับใครก็ได้ ถ้าคนนั้นตาย เราตายด้วย', nightOrder: 12, team: 'WOLF' },
];

// DOM Elements
const playerInput = document.getElementById('player-input');
const playerRoster = document.getElementById('player-roster');
const setupSection = document.getElementById('setup-section');
const gameDashboard = document.getElementById('game-dashboard');
const activePlayersList = document.getElementById('active-players');
const modal = document.getElementById('modal');
const winnerModal = document.getElementById('winner-modal');
const phaseDisplay = document.getElementById('phase-display');
const timerDisplay = document.getElementById('timer');
const narratorGuide = document.getElementById('narrator-guide');

// --- SETUP FUNCTIONS ---

function initSetup() {
    // Allow enter key to add player
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });
}

function addPlayer() {
    const name = playerInput.value.trim();
    if (!name) return;

    players.push({
        id: Date.now().toString(),
        name: name,
        roleId: 'villager', // Default
        isAlive: true
    });

    playerInput.value = '';
    renderPlayerRoster();
}

function renderPlayerRoster() {
    if (players.length === 0) {
        playerRoster.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">ยังไม่มีผู้เล่น</p>';
        return;
    }

    playerRoster.innerHTML = players.map(p => {
        const roleOptions = ROLES_CONFIG.map(r =>
            `<option value="${r.id}" ${p.roleId === r.id ? 'selected' : ''}>${r.name}</option>`
        ).join('');

        return `
        <div class="player-roster-item">
            <input type="text" value="${p.name}" onchange="updatePlayerName('${p.id}', this.value)" style="flex:1;">
            <select onchange="updatePlayerRole('${p.id}', this.value)" style="flex:1.5;">
                ${roleOptions}
            </select>
            <button onclick="removePlayer('${p.id}')" style="background:#d32f2f; padding: 10px;"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    }).join('');
}

function updatePlayerName(id, val) {
    const p = players.find(x => x.id === id);
    if (p) p.name = val;
}

function updatePlayerRole(id, val) {
    const p = players.find(x => x.id === id);
    if (p) p.roleId = val;
}

function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    renderPlayerRoster();
}

// --- GAME LOGIC ---

function startGame() {
    if (players.length < 3) {
        alert("ต้องการผู้เล่นอย่างน้อย 3 คนในการเริ่มเกม");
        return;
    }

    // Switch View
    setupSection.classList.add('hidden');
    gameDashboard.classList.remove('hidden');

    // Assign proper role objects
    players.forEach(p => {
        p.roleObj = ROLES_CONFIG.find(r => r.id === p.roleId);
        p.isAlive = true; // Ensure alive on start
    });

    gamePhase = 'DAY'; // V3: Start with DAY
    resetTimer(300); // 5 minutes
    updatePhaseDisplay();
    renderGameList();
}

function resetGame() {
    if (!confirm("ต้องการรีเซ็ตเกมหรือไม่? ข้อมูลปัจจุบันจะหายไป")) return;

    winnerModal.classList.remove('active');
    // We keep the players list for "Play Again" convenience, but reset stats
    // Or full reset? Let's check user intent. "Play Again" usually implies same group.
    // Let's reset to SETUP phase but keep roster.

    gamePhase = 'SETUP';
    gameDashboard.classList.add('hidden');
    setupSection.classList.remove('hidden');

    // Reset timer
    resetTimer(0);
}

function renderGameList() {
    activePlayersList.innerHTML = players.map(p => `
        <div class="player-card ${!p.isAlive ? 'dead' : ''}" onclick="toggleLife('${p.id}')">
            <div class="player-info">
                <div class="player-name">${p.name}</div>
                <div class="player-role"><i class="fa-solid ${p.roleObj.icon}"></i> ${p.roleObj.name}</div>
            </div>
            <div class="actions">
                ${p.isAlive ?
            `<button class="kill-btn" onclick="event.stopPropagation(); killPlayer('${p.id}')">ฆ่า / โหวตออก</button>`
            : '<i class="fa-solid fa-skull"></i>'}
            </div>
        </div>
    `).join('');
}

function toggleLife(id) {
    const p = players.find(pl => pl.id === id);
    if (!p) return;

    // Revive
    if (!p.isAlive && confirm(`ต้องการชุบชีวิต ${p.name} ใช่หรือไม่?`)) {
        p.isAlive = true;
        renderGameList();
        checkWinCondition();
    }
}

function killPlayer(id) {
    const p = players.find(pl => pl.id === id);
    if (!p) return;

    // Special Warnings before Action
    if (p.roleObj.id === 'tough_guy' && gamePhase === 'NIGHT') {
        alert("⚠️ นี่คือคนถึก! เขาจะไม่ตายทันที แต่จะตายในวันถัดไป (Moderator Note/Jode)");
    }
    if (p.roleObj.id === 'huntress' && gamePhase === 'NIGHT') {
        alert("⚠️ นี่คือพรานหญิง! หมาป่าฆ่าไม่ได้ (ยกเว้นโดนแม่มดยาพิษหรืออื่นๆ)");
    }
    if ((p.roleObj.id === 'prince' || p.roleObj.id === 'fool') && gamePhase === 'DAY') {
        alert("⚠️ ระวัง! บทบาทนี้มีผลพิเศษเมื่อถูกโหวต (ไม่ตาย หรือ แค่เปิดเผยตัว)");
    }
    // Deluxe Warnings
    if (p.roleObj.id === 'cursed' && gamePhase === 'NIGHT') {
        alert("⚠️ นี่คือ 'คนที่ถูกสาป'! ถ้าถูกหมาป่าโจมตี ห้ามฆ่า! แต่ให้เปลี่ยนเป็นฝ่ายหมาป่าแทน");
        return; // Optional: Stop execution here? Or let Moderator decide if it was witch's poison. Let's just alert.
    }
    if (p.roleObj.id === 'seer') {
        // Check for Apprentice Seer
        const apprentice = players.find(ap => ap.isAlive && ap.roleObj.id === 'apprentice_seer');
        if (apprentice) {
            alert(`ℹ️ ผู้หยั่งรู้ตายแล้ว! อย่าลืมแจ้งศิษย์ผู้หยั่งรู้ (${apprentice.name}) ให้เลื่อนขั้น!`);
        }
    }
    // Extreme Warnings
    if ((p.roleObj.id === 'dire_wolf' && p.isAlive)) {
        alert("⚠️ หมาป่าทมิฬ (Dire Wolf) ตาย! อย่าลืมตรวจสอบว่าคู่หูของเขาต้องตายตามไปด้วยหรือไม่!");
    }
    if (p.roleObj.id === 'vampire_elder' && gamePhase === 'NIGHT') {
        alert("⚠️ แม่เฒ่าแวมไพร์! หมาป่าฆ่าไม่ได้ (Immune to Wolf)");
    }

    if (confirm(`ยืนยันการสังหาร/โหวตออก: ${p.name} ?`)) {
        p.isAlive = false;
        renderGameList();

        // 1. BEGGAR WIN CHECK
        if (p.roleObj.id === 'beggar' && gamePhase === 'DAY') {
            announceWinner('ฝ่ายยาจก (Beggar Team)');
            return;
        }

        // 2. Standard Win Check
        checkWinCondition();

        // 3. Alerts Post-Death
        if (p.roleObj.id === 'hunter') {
            alert("⚠️ นายพรานตาย! ถามเขาว่าจะยิงใครไปด้วยไหม?");
        }
        if (p.roleObj.id === 'cub') {
            alert("⚠️ ลูกหมาตาย! คืนพรุ่งนี้หมาป่าจะฆ่าได้ 2 ศพ!");
        }
        if (p.roleObj.id === 'fool' && gamePhase === 'DAY') {
            alert("ℹ️ ถ้าเป็นคนบ้าโดนโหวต: ให้ชุบชีวิตขึ้นมาแล้วเปิดการ์ดแทน!");
        }
    }
}

function checkWinCondition() {
    const alivePlayers = players.filter(p => p.isAlive);
    const wolves = alivePlayers.filter(p => p.roleObj.team === 'WOLF').length;
    const villagers = alivePlayers.filter(p => p.roleObj.team === 'VILLAGER' || p.roleObj.team === 'NEUTRAL').length;
    // Usually Neutral counts as "Good" for ratio calculation unless specified otherwise,
    // but typically Game ends when Wolf >= Villagers (Good guys).

    if (wolves === 0) {
        announceWinner('ฝ่ายชาวบ้าน (Villager Team)');
    } else if (wolves >= villagers) {
        announceWinner('ฝ่ายหมาป่า (Werewolf Team)');
    }
}

function announceWinner(teamName) {
    document.getElementById('winner-name').innerText = `ผู้ชนะ: ${teamName}`;
    winnerModal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// --- PHASE & TIMER ---

function updatePhaseDisplay() {
    const thaiPhase = gamePhase === 'NIGHT' ? 'กลางคืน (Night)' : 'กลางวัน (Day)';
    phaseDisplay.innerText = thaiPhase;
    document.body.style.borderColor = gamePhase === 'NIGHT' ? '#0a0a20' : '#d35400';
    updateNarratorGuide();
}

function updateNarratorGuide() {
    if (gamePhase === 'DAY') {
        narratorGuide.innerHTML = "<strong>คู่มือคนเล่าเรื่อง:</strong><br>1. ประกาศคนตาย<br>2. เริ่มจับเวลา<br>3. สรุปผลโหวตและเลือกคนตาย";
    } else {
        const activeRoles = [...new Set(players.map(p => p.roleObj))];
        const nightSteps = activeRoles
            .filter(r => r.nightOrder > 0)
            .sort((a, b) => a.nightOrder - b.nightOrder);

        const list = nightSteps.map(r => `&bull; ${r.name}`).join('<br>');
        narratorGuide.innerHTML = "<strong>ลำดับการเรียก (Night Order):</strong><br>" + (list || "ไม่มีบทบาทที่ต้องตื่น");
    }
}

function nextPhase() {
    if (gamePhase === 'NIGHT') {
        gamePhase = 'DAY';
        resetTimer(300); // Reset to 5 mins on Day start
    } else {
        gamePhase = 'NIGHT';
        resetTimer(0); // Night usually doesn't need fixed timer, but can be 0 or custom
    }
    updatePhaseDisplay();
}

function toggleTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timer-icon').className = 'fa-solid fa-play';
    } else {
        timerInterval = setInterval(() => {
            if (time > 0) {
                time--;
                updateTimerDisplay();
            } else {
                // Time up
                clearInterval(timerInterval);
                timerInterval = null;
                alert("หมดเวลา! (Time's up!)");
                document.getElementById('timer-icon').className = 'fa-solid fa-stopwatch';
            }
        }, 1000);
        document.getElementById('timer-icon').className = 'fa-solid fa-pause';
    }
}

function resetTimer(newTime) {
    clearInterval(timerInterval);
    timerInterval = null;
    time = (newTime !== undefined) ? newTime : 300;
    updateTimerDisplay();
    document.getElementById('timer-icon').className = 'fa-solid fa-stopwatch';
}

function updateTimerDisplay() {
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
}

// Initialize
initSetup();
