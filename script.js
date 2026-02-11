// Game State
let players = [];
let gamePhase = 'SETUP'; // SETUP, NIGHT, DAY
let time = 300; // 5 minutes default
let timerInterval = null;
let roleSelectionMode = 'random'; // 'random' or 'manual'
let availableRolesForRound = []; // Roles generated for this round - restricts player selection
let maxPlayers = 0; // Maximum number of players set by user


// Configurable Roles (Thai Translations)
const ROLES_CONFIG = [
    // --- Villager Team (ฝ่ายชาวบ้าน) ---
    { id: 'apprentice_seer', name: 'ผู้หยั่งรู้ฝึกหัด', icon: 'fa-graduation-cap', desc: 'จะกลายเป็นผู้หยั่งรู้แทนเมื่อผู้หยั่งรู้ตาย และตื่นพร้อมผู้หยั่งรู้ทุกคืน', nightOrder: 42, team: 'VILLAGER' },
    { id: 'aura_seer', name: 'ผู้หยั่งรู้ออร่า', icon: 'fa-eye-low-vision', desc: 'ชี้ผู้เล่นเพื่อดูว่าเป็นชาวบ้าน/หมาป่าธรรมดาหรือไม่ (คว่ำ=ธรรมดา, ชู=พิเศษ)', nightOrder: 41, team: 'VILLAGER' },
    { id: 'beholder', name: 'ผู้เฝ้ามอง', icon: 'fa-binoculars', desc: 'คืนแรกจะรู้ว่าใครเป็นผู้หยั่งรู้ (แนะนำให้ผู้หยั่งรู้ชูนิ้วโป้งให้ดู)', nightOrder: 2, team: 'VILLAGER' },
    { id: 'bodyguard', name: 'บอดี้การ์ด', icon: 'fa-shield-halved', desc: 'ปกป้องคนได้ 1 คนต่อคืน (ห้ามซ้ำ, ห้ามกันตัวเอง) คนที่โดนปกป้องจะไม่ตาย', nightOrder: 10, team: 'VILLAGER' },
    { id: 'cupid', name: 'คิวปิด', icon: 'fa-heart', desc: 'เลือก 2 คนเป็นคู่รัก (ถ้าคนนึงตาย อีกคนตายด้วย) ถ้าอยู่คนละฝ่ายจะเป็นทีมใหม่ชนะเมื่อเหลือ 2 คนสุดท้าย', nightOrder: 1, team: 'VILLAGER' },
    { id: 'diseased', name: 'ผู้ติดโรค', icon: 'fa-biohazard', desc: 'ถ้าโดนหมาป่าฆ่า คืนถัดไปหมาป่าจะฆ่าใครไม่ได้ (ผู้ดำเนินเกมประกาศตอนเช้า)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'hunter', name: 'นายพราน', icon: 'fa-crosshairs', desc: 'ถ้าถูกฆ่าตอนกลางคืน ตอนเช้าจะได้เลือกยิง 1 คน (ผู้ดำเนินเกมประกาศการตาย)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'huntress', name: 'พรานหญิง', icon: 'fa-person-rifle', desc: 'ตื่นทุกคืนเพื่อเลือกใช้ความสามารถสังหาร 1 คน (ผู้ดำเนินเกมต้องเรียกทุกคืนจนกว่าจะใช้)', nightOrder: 62, team: 'VILLAGER' },
    { id: 'insomniac', name: 'หน่องนอนไม่หลับ', icon: 'fa-bed', desc: 'รู้ว่าคนนั่งข้างซ้าย/ขวาตื่นหรือไม่ (ผู้ดำเนินเกมชูนิ้ว=ตื่น)', nightOrder: 90, team: 'VILLAGER' },
    { id: 'lycan', name: 'ลูกครึ่งหมา', icon: 'fa-dog', desc: 'ฝ่ายชาวบ้าน แต่ผู้หยั่งรู้จะเห็นเป็นหมาป่า', nightOrder: 0, team: 'VILLAGER' },
    { id: 'mason', name: 'กลุ่มภราดรภาพ', icon: 'fa-trowel-bricks', desc: 'คืนแรกลืมตามาจำหน้ากัน ห้ามใครพูดถึงกลุ่มภราดรภาพไม่งั้นคืนถัดไปตาย (นับว่าแพ้)', nightOrder: 3, team: 'VILLAGER' },
    { id: 'old_woman', name: 'หญิงแก่', icon: 'fa-person-cane', desc: 'ทุกคืนเลือกไล่คนออกจากเมือง 1 วัน (ห้ามพูด/โหวต/โดนฆ่า) ห้ามเลือกซ้ำ/ตัวเอง', nightOrder: 81, team: 'VILLAGER' },
    { id: 'pacifist', name: 'ผู้รักสงบ', icon: 'fa-peace', desc: 'ห้ามโหวตประหารใคร (ถ้าให้สนุก ผู้ดำเนินเกมอย่าบอกว่ามีบทนี้)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'pi', name: 'คนอวดผี', icon: 'fa-magnifying-glass', desc: 'ชี้คนเพื่อดูว่าเขาหรือคนข้างๆ เป็นหมาป่าไหม (ชู=มี, คว่ำ=ไม่มี) ไม่บอกจำนวน', nightOrder: 43, team: 'VILLAGER' },
    { id: 'priest', name: 'บาทหลวง', icon: 'fa-cross', desc: 'เลือกมอบพรให้คน 1 ครั้ง เพื่อกันตายได้ 1 ครั้ง (แม้บาทหลวงตายพรก็ยังอยู่)', nightOrder: 11, team: 'VILLAGER' },
    { id: 'prince', name: 'เจ้าชาย', icon: 'fa-crown', desc: 'ถ้าถูกโหวตประหาร จะไม่ตายแต่ต้องเปิดเผยบทบาทและจบวันทันที (แต่โดนฆ่ากลางคืนตายปกติ)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'revealer', name: 'ผู้เปิดเผยตัวตน', icon: 'fa-clapperboard', desc: 'เลือก 1 คน ถ้าเป็นหมาป่า(รวมลูกครึ่งหมา) มันตาย ถ้าไม่ใช่ เราตาย', nightOrder: 63, team: 'VILLAGER' },
    { id: 'seer', name: 'ผู้หยั่งรู้', icon: 'fa-eye', desc: 'ชี้คนเพื่อดูว่าเป็นหมาป่าไหม (ชู=ใช่, คว่ำ=ไม่ใช่) บทอื่นๆ เช่น แวมไพร์/ลูกสมุน นับว่าไม่ใช่', nightOrder: 40, team: 'VILLAGER' },
    { id: 'spellcaster', name: 'ผู้ร่ายเวท', icon: 'fa-wand-magic-sparkles', desc: 'เลือกใบ้ 1 คน ห้ามพูด/เสนอ/โหวต ในเช้าถัดไป (ผู้ดำเนินเกมต้องประกาศคนโดน)', nightOrder: 80, team: 'VILLAGER' },
    { id: 'tough_guy', name: 'หนุ่มบึ้ก', icon: 'fa-dumbbell', desc: 'ถ้าโดนหมาป่าฆ่า จะยังไม่ตายจนกว่าจะเช้าถัดไป', nightOrder: 0, team: 'VILLAGER' },
    { id: 'troublemaker', name: 'ผู้สร้างปัญหา', icon: 'fa-shuffle', desc: 'เลือกใช้พลังทำให้วันถัดไปต้องโหวตประหาร 2 คน', nightOrder: 15, team: 'VILLAGER' },
    { id: 'villager_idiot', name: 'ชาวบ้านผู้โง่เง่า', icon: 'fa-face-grin-tongue-wink', desc: 'ต้องโหวตประหารใครสักคนทุกเช้า (ถ้าให้สนุก ผู้ดำเนินเกมอย่าบอกว่ามีบทนี้)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'villager', name: 'ชาวบ้านธรรมดา', icon: 'fa-user', desc: 'ช่วยกันจับผิดและโหวตประหาร', nightOrder: 0, team: 'VILLAGER' },
    { id: 'witch', name: 'แม่มด', icon: 'fa-hat-wizard', desc: 'มียาฆ่า/ยาช่วยอย่างละขวด รู้ว่าใครกำลังจะโดนฆ่า(ผู้ดำเนินเกมชี้ให้ดู)', nightOrder: 30, team: 'VILLAGER' },

    // --- Self Team (ฝ่ายตัวเอง) ---
    { id: 'chupacabra', name: 'ชูปากาบรัส', icon: 'fa-dragon', desc: 'เลือกฆ่า 1 คน ถ้าเป็นหมาป่า หมาป่าตาย (ถ้าหมาป่าหมดแล้วฆ่าใครก็ได้) ชนะเมื่อเหลือคนเดียว', nightOrder: 60, team: 'SOLO' },
    { id: 'cult_leader', name: 'ผู้นำลัทธิ', icon: 'fa-users-rays', desc: 'ชวนคนเข้าลัทธิทุกคืน ชนะเมื่อทุกคนอยู่ในลัทธิ (ถ้าเราตายลัทธิล่ม)', nightOrder: 55, team: 'SOLO' },
    { id: 'hoodlum', name: 'อันธพาล', icon: 'fa-hand-fist', desc: 'คืนแรกเลือกคนตามจำนวนหมาป่า ถ้าคนเหล่านั้นตายก่อนเรา เราชนะ', nightOrder: 4, team: 'SOLO' },
    { id: 'lone_wolf', name: 'หมาป่าเดียวดาย', icon: 'fa-wolf-pack-battalion', desc: 'ตื่นพร้อมหมาป่า ชนะเมื่อเหลือคนสุดท้ายหรือเหลือเหยื่อ 1 คน', nightOrder: 20, team: 'WOLF_SOLO' },
    { id: 'tanner', name: 'ยาจก', icon: 'fa-hand-holding-dollar', desc: 'ชนะเมื่อถูกโหวตประหารเท่านั้น', nightOrder: 0, team: 'SOLO' },
    { id: 'vampire', name: 'แวมไพร์', icon: 'fa-tooth', desc: 'เลือกเหยื่อ 1 คน เหยื่อจะตายถ้าถูกเสนอชื่อโหวตอีกในเช้าถัดมา (แวมไพร์หมาป่าฆ่าไม่ตาย)', nightOrder: 61, team: 'VAMPIRE' },

    // --- Half/Mixed (ครึ่งคนครึ่งร้าย) ---
    { id: 'cursed', name: 'ผู้โดนสาป', icon: 'fa-book-skull', desc: 'อยู่ทีมชาวบ้าน จนกว่าจะโดนหมาป่าฆ่าจะกลายเป็นหมาป่า (ตื่นพร้อมหมาป่าทุกคืน แม้ยังไม่เปลี่ยน)', nightOrder: 19, team: 'VILLAGER' },
    { id: 'doppelganger', name: 'ด็อพเพิลเก็งเงอร์', icon: 'fa-masks-theater', desc: 'คืนแรกเลือก 1 คน ถ้าเขาตายเราสวมบทแทน (อยู่ทีมชาวบ้านจนกว่าจะสวมบท)', nightOrder: 5, team: 'VILLAGER' },
    { id: 'drunk', name: 'คนเมา', icon: 'fa-wine-bottle', desc: 'ไม่รู้บทตัวเองจนคืนที่ 3 (สุ่มหยิบการ์ด)', nightOrder: 100, team: 'VILLAGER' },

    // --- Wolf Team (ฝ่ายหมาป่า) ---
    { id: 'dire_wolf', name: 'หมาป่าโลกันตร์', icon: 'fa-link', desc: 'เลือก 1 สหาย ถ้าเขาตายเราตายด้วย (ถ้าเราตายสหายไม่ตาย)', nightOrder: 21, team: 'WOLF' },
    { id: 'minion', name: 'ลูกสมุน', icon: 'fa-mask', desc: 'รู้ว่าใครเป็นหมาป่า แต่หมาป่าไม่รู้เรา ช่วยปั่นชาวบ้าน', nightOrder: 22, team: 'WOLF' },
    { id: 'sorceress', name: 'แม่มดร้าย', icon: 'fa-hat-witch', desc: 'เลือกดูว่าใครเป็นผู้หยั่งรู้ (ชู=ใช่, คว่ำ=ไม่ใช่) ไม่รู้ว่าใครเป็นหมาป่า', nightOrder: 44, team: 'WOLF' },
    { id: 'werewolf', name: 'หมาป่าธรรมดา', icon: 'fa-wolf-pack-battalion', desc: 'ตื่นมาโหวตฆ่า (ห้ามฆ่ากันเอง)', nightOrder: 20, team: 'WOLF' },
    { id: 'wolf_cub', name: 'ลูกหมาป่า', icon: 'fa-paw', desc: 'ถ้าตาย คืนถัดไปหมาป่าฆ่าได้ 2 คน', nightOrder: 20, team: 'WOLF' },
    { id: 'wolf_man', name: 'มนุษย์หมาป่า', icon: 'fa-people-arrows', desc: 'บทบาทที่หาหมาป่าจะเห็นเราเป็นชาวบ้าน', nightOrder: 20, team: 'WOLF' }
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

    // Allow enter key to set player count
    const playerCountInput = document.getElementById('player-count-input');
    if (playerCountInput) {
        playerCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') setPlayerCount();
        });
    }
}

function setPlayerCount() {
    const input = document.getElementById('player-count-input');
    const count = parseInt(input.value);

    // Validate input
    if (isNaN(count) || count < 3 || count > 20) {
        alert('กรุณากรอกจำนวนผู้เล่นระหว่าง 3-20 คน');
        return;
    }

    // Set max players
    maxPlayers = count;

    // Update UI
    const statusSpan = document.getElementById('player-count-status');
    statusSpan.innerHTML = `<strong style="color: #4ecdc4;">จำนวนผู้เล่น: ${maxPlayers} คน</strong>`;

    // Disable player count input after setting
    input.disabled = true;
    input.style.opacity = '0.6';

    // Enable role randomizer section
    const roleRandomizer = document.getElementById('role-randomizer');
    roleRandomizer.style.opacity = '1';
    roleRandomizer.style.pointerEvents = 'auto';

    // Enable player registration section
    const playerRegistration = document.getElementById('player-registration-section');
    playerRegistration.style.opacity = '1';
    playerRegistration.style.pointerEvents = 'auto';

    // Update player count display
    updatePlayerCountDisplay();

    // Scroll to role section
    roleRandomizer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


function addPlayer() {
    const name = playerInput.value.trim();
    if (!name) return;

    // Check if player count is set
    if (maxPlayers === 0) {
        alert('กรุณากรอกจำนวนผู้เล่นก่อน');
        return;
    }

    // Check if max players reached
    if (players.length >= maxPlayers) {
        alert(`ลงทะเบียนครบแล้ว (${maxPlayers}/${maxPlayers} คน)`);
        return;
    }

    players.push({
        id: Date.now().toString(),
        name: name,
        roleId: 'villager', // Default
        isAlive: true,
        isLover: false
    });

    playerInput.value = '';
    renderPlayerRoster();
    updatePlayerCountDisplay();
}

function updatePlayerCountDisplay() {
    const countSpan = document.getElementById('player-count');
    if (countSpan && maxPlayers > 0) {
        const registered = players.length;
        const color = registered === maxPlayers ? '#4ecdc4' : '#f1c40f';
        countSpan.innerHTML = `<span style="color: ${color};">(${registered}/${maxPlayers})</span>`;
    }

    // Enable/disable start button based on registration completion
    const startBtn = document.getElementById('start-btn');
    if (players.length === maxPlayers && maxPlayers > 0) {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
    } else {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
    }

    // Disable add player input when full
    const playerInputField = document.getElementById('player-input');
    const addButton = playerInputField?.nextElementSibling;
    if (players.length >= maxPlayers) {
        if (playerInputField) playerInputField.disabled = true;
        if (addButton) addButton.disabled = true;
    } else {
        if (playerInputField) playerInputField.disabled = false;
        if (addButton) addButton.disabled = false;
    }
}

function renderPlayerRoster() {
    const countSpan = document.getElementById('player-count');
    if (countSpan) countSpan.innerText = `(${players.length})`;

    if (players.length === 0) {
        playerRoster.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">ยังไม่มีผู้เล่น</p>';
        return;
    }

    playerRoster.innerHTML = players.map(p => {
        // If roles have been generated for this round, only show those roles
        let rolesToShow = ROLES_CONFIG;
        if (availableRolesForRound.length > 0) {
            // Get unique role IDs from the generated roles
            const uniqueRoleIds = [...new Set(availableRolesForRound)];
            rolesToShow = ROLES_CONFIG.filter(r => uniqueRoleIds.includes(r.id));
        }

        const roleOptions = rolesToShow.map(r =>
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
    updatePlayerCountDisplay();
}

// --- GAME LOGIC ---

function startGame() {
    // Check if player count is set
    if (maxPlayers === 0) {
        alert('กรุณากรอกจำนวนผู้เล่นก่อน');
        return;
    }

    // Check if all players are registered
    if (players.length !== maxPlayers) {
        alert(`กรุณาลงทะเบียนผู้เล่นให้ครบ ${maxPlayers} คน (ปัจจุบันลงทะเบียน ${players.length} คน)`);
        return;
    }

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
        p.isLover = false; // Reset lover status
    });

    gamePhase = 'NIGHT'; // Request: Start with NIGHT
    resetTimer(0); // Night usually has no fixed limit
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

    // Reset roles to Villager default
    players.forEach(p => p.roleId = 'villager');
    renderPlayerRoster();

    // Reset timer
    resetTimer(0);
}

function renderGameList() {
    const hasCupid = players.some(p => p.roleObj.id === 'cupid');
    const loverCount = players.filter(p => p.isLover).length;

    // Sort players: Alive first, Dead last
    const sortedPlayers = [...players].sort((a, b) => {
        if (a.isAlive === b.isAlive) return 0;
        return a.isAlive ? -1 : 1;
    });

    activePlayersList.innerHTML = sortedPlayers.map(p => `
        <div class="player-card ${!p.isAlive ? 'dead' : ''}" onclick="toggleLife('${p.id}')">
            <div class="player-info">
                <div class="player-name">
                    ${p.name} 
                    ${p.isLover ? '<span style="color:pink; margin-left:5px;"><i class="fa-solid fa-heart"></i> คู่รัก</span>' : ''}
                </div>
                <div class="player-role"><i class="fa-solid ${p.roleObj.icon}"></i> ${p.roleObj.name}</div>
            </div>
            <div class="actions">
                ${p.isAlive ?
            `<button class="kill-btn" onclick="event.stopPropagation(); killPlayer('${p.id}')">ฆ่า / โหวตออก</button>
             ${(hasCupid && (loverCount < 2 || p.isLover)) ? `<button class="kill-btn" style="background-color: pink; color: white;" onclick="event.stopPropagation(); toggleLover('${p.id}')">❤️</button>` : ''}`
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

function toggleLover(id) {
    const p = players.find(pl => pl.id === id);
    if (!p) return;
    p.isLover = !p.isLover;
    renderGameList();
}

function killPlayer(id) {
    const p = players.find(pl => pl.id === id);
    if (!p) return;

    // --- Special Warnings (ก่อนตาย) ---
    if (p.roleObj.id === 'tough_guy' && gamePhase === 'NIGHT') {
        alert("⚠️ หนุ่มบึ้ก! ยังไม่ตายทันที ไปตายตอนเช้าวันถัดไป (ผู้ดำเนินเกมอย่าเพิ่งประกาศตาย)");
    }
    if (p.roleObj.id === 'cursed' && gamePhase === 'NIGHT') {
        alert("⚠️ ผู้โดนสาป! ถ้าโดนหมาป่าฆ่า ให้เปลี่ยนฝ่ายเป็นหมาป่าแทนการตาย! (ชูนิ้วบอกเขา)");
        return; // ผู้ดำเนินเกมจัดการเอง
    }
    if (p.roleObj.id === 'huntress' && gamePhase === 'NIGHT') {
        alert("⚠️ พรานหญิง! หมาป่าฆ่าไม่ได้ (ยกเว้นโดนยาพิษแม่มด)");
    }
    if (p.roleObj.id === 'diseased' && gamePhase === 'NIGHT') {
        alert("⚠️ ผู้ติดโรคตาย! คืนถัดไปหมาป่าจะฆ่าใครไม่ได้ (ผู้ดำเนินเกมต้องประกาศตอนเช้า)");
    }
    if (p.roleObj.id === 'vampire') {
        alert("⚠️ แวมไพร์! ถ้าโดนโหวตตอนเช้า จะยังไม่ตาย ต้องโดนโหวตอีกครั้งในเช้าถัดไป (ยกเว้นโดนล่าจากบทอื่น)");
    }
    if (p.roleObj.id === 'minion' || p.roleObj.id === 'mason' || p.roleObj.id === 'dire_wolf') {
        alert("ℹ️ บทบาทนี้มีความสัมพันธ์พิเศษ เช็คการตายของคู่หูด้วย");
    }

    if (confirm(`ยืนยันการสังหาร/โหวตออก: ${p.name} (${p.roleObj.name}) ?`)) {
        p.isAlive = false;

        // --- Cupid / Lover Chain Death ---
        if (p.isLover) {
            const otherLovers = players.filter(op => op.isAlive && op.isLover && op.id !== p.id);
            if (otherLovers.length > 0) {
                alert(`💔 คู่รักตรอมใจ! ${otherLovers.map(l => l.name).join(', ')} ต้องตายตกไปตามกัน!`);
                otherLovers.forEach(l => l.isAlive = false);
            }
        }

        renderGameList();

        // 1. ยาจกชนะ
        if (p.roleObj.id === 'tanner' && gamePhase === 'DAY') {
            announceWinner('ฝ่ายยาจก (ชนะแล้ว!)');
            return;
        }

        // 2. ตรวจสอบเงื่อนไขการชนะ
        checkWinCondition();

        // 3. การแจ้งเตือนหลังตาย
        if (p.roleObj.id === 'hunter') {
            alert("🔫 นายพรานตาย! ให้เขาเลือกยิง 1 คนทันที");
        }
        if (p.roleObj.id === 'wolf_cub') {
            alert("🐺 ลูกหมาป่าตาย! คืนพรุ่งนี้หมาป่าฆ่าได้ 2 ศพ");
        }
        if (p.roleObj.id === 'prince' && gamePhase === 'DAY') {
            alert("👑 เจ้าชายถูกโหวต! ไม่ตายแต่ต้องเปิดการ์ดโชว์");
            p.isAlive = true; // ชุบชีวิตทันทีตามกลไกของเกม
            renderGameList();
        }
        if (p.roleObj.id === 'old_woman') {
            alert("👵 หญิงแก่ตาย! การไล่คนออกจากเมืองสิ้นสุดลง");
        }
    }
}

function checkWinCondition() {
    const alive = players.filter(p => p.isAlive);
    const wolves = alive.filter(p => ['werewolf', 'white_wolf', 'big_bad_wolf', 'wolf_cub', 'wolf_man', 'dire_wolf', 'lone_wolf'].includes(p.roleObj.id) || p.roleObj.team === 'WOLF');
    const vampires = alive.filter(p => p.roleObj.team === 'VAMPIRE');
    const soloKillers = alive.filter(p => ['serial_killer', 'chupacabra', 'hoodlum', 'cult_leader'].includes(p.roleObj.id));

    // จำนวนผู้เล่น
    const wolfCount = wolves.length;
    const vampCount = vampires.length;
    const soloCount = soloKillers.length;

    // 1. ชูปากาบรัสชนะ (เหลือคนเดียว)
    const chupa = alive.find(p => p.roleObj.id === 'chupacabra');
    if (chupa && alive.length === 1) {
        announceWinner('ชูปากาบรัส (ชนะเพียงลำพัง!)');
        return;
    }

    // 2. หมาป่าเดียวดายชนะ (หมาป่าตัวสุดท้าย)
    const lone = alive.find(p => p.roleObj.id === 'lone_wolf');
    if (lone && wolfCount === 1 && alive.length === 1) {
        announceWinner('หมาป่าเดียวดาย (ชนะเพียงลำพัง!)');
        return;
    }

    // 3. หมาป่าขาวชนะ (เหลือคนเดียว)
    const white = alive.find(p => p.roleObj.id === 'white_wolf');
    if (white && alive.length === 1) {
        announceWinner('หมาป่าขาว (ชนะเพียงลำพัง!)');
        return;
    }

    // 4. ผู้นำลัทธิ (ทุกคนที่มีชีวิตอยู่ในลัทธิ? ยากที่จะติดตามอัตโนมัติ ข้ามไปตรวจสอบด้วยตนเอง)
    // 5. อันธพาล (ข้ามการตรวจสอบเป้าหมาย ตรวจสอบด้วยตนเอง)

    // 6. ดีกับร้ายมาตรฐาน
    // ชาวบ้านชนะ: ไม่มีคนร้าย
    if (wolfCount === 0 && vampCount === 0 && soloCount === 0) {
        announceWinner('ฝ่ายชาวบ้าน');
        return;
    }

    // หมาป่าชนะ: หมาป่า >= ไม่ใช่หมาป่า
    // (หมายเหตุ: กฎมาตรฐานบอกว่าหมาป่าชนะเมื่อเท่ากับชาวบ้าน)
    const nonWolves = alive.length - wolfCount;
    if (vampCount === 0 && soloCount === 0 && wolfCount > 0 && wolfCount >= nonWolves) {
        announceWinner('ฝ่ายหมาป่า');
        return;
    }

    // แวมไพร์ชนะ
    const nonVamps = alive.length - vampCount;
    if (wolfCount === 0 && soloCount === 0 && vampCount > 0 && vampCount >= nonVamps) {
        announceWinner('ฝ่ายแวมไพร์');
        return;
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
    const thaiPhase = gamePhase === 'NIGHT' ? 'กลางคืน' : 'กลางวัน';
    phaseDisplay.innerText = thaiPhase;

    // Theme Switch
    if (gamePhase === 'DAY') {
        document.body.classList.add('day-mode');
        document.body.style.borderColor = '#d35400'; // Fallback / Specific border
    } else {
        document.body.classList.remove('day-mode');
        document.body.style.borderColor = '#0a0a20';
    }

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
                alert("หมดเวลา!");
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

// --- ROLE RANDOMIZER ---

let currentProposedRoles = [];

function generateRoles(difficulty) {
    // Check if player count is set
    if (maxPlayers === 0) {
        alert('กรุณากรอกจำนวนผู้เล่นก่อน');
        return;
    }

    const count = maxPlayers; // Use maxPlayers instead of players.length
    let roles = [];

    // Base Wolf Count (Approx 1/3 or 1/4)
    let wolfCount = Math.floor(count / 3.5);
    if (wolfCount < 1) wolfCount = 1;

    // Safety cap for wolves
    if (wolfCount > count - 2) wolfCount = count - 2;

    // --- 1. Get Allowed Roles (Filter) ---
    // If selector is hidden/empty (never opened), assume ALL allowed.
    // Or better: ensure renderRoleSelector is called at least once or checks default.
    const container = document.getElementById('custom-role-list');
    let allowedRoles = [];

    if (container.innerHTML.trim() === '') {
        // Not rendered yet -> Allow All
        allowedRoles = ROLES_CONFIG.map(r => r.id);
    } else {
        const checkboxes = document.querySelectorAll('#custom-role-list input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert("กรุณาเลือกบทบาทใน Config อย่างน้อย 1 อย่าง (หรือกด เลือกทั้งหมด)");
            return;
        }
        allowedRoles = Array.from(checkboxes).map(cb => cb.value);
    }

    // Helper to check if role is allowed
    const isAllowed = (id) => allowedRoles.includes(id);

    if (difficulty === 'EASY') {
        // 1. Wolves (Standard Werewolf only)
        // If 'werewolf' not allowed, force it? Or warn? Let's try to respect filter.
        // If no wolves allowed, game breaks. Fallback:
        if (!isAllowed('werewolf')) {
            // Warn? or just proceed? Let's add if allowed.
        }

        for (let i = 0; i < wolfCount; i++) {
            if (isAllowed('werewolf')) roles.push('werewolf');
        }

        // 2. Core Villagers (Only if allowed)
        if (isAllowed('seer')) roles.push('seer');
        if (count >= 5 && isAllowed('bodyguard')) roles.push('bodyguard');

        // 3. Fill with Villagers (Only if allowed, else random allowed villager?)
        // If villager not allowed, fill with random allowed good roles?
        while (roles.length < count) {
            if (isAllowed('villager')) {
                roles.push('villager');
            } else {
                // Fallback: pick any allowed villager team
                const allowedV = ROLES_CONFIG.filter(r => r.team === 'VILLAGER' && isAllowed(r.id)).map(r => r.id);
                if (allowedV.length > 0) {
                    roles.push(allowedV[Math.floor(Math.random() * allowedV.length)]);
                } else {
                    break; // Can't fill
                }
            }
        }
    }
    else if (difficulty === 'MEDIUM') {
        // 1. Wolves (Maybe 1 special)
        const specialWolves = ['minion', 'wolf_cub'].filter(id => isAllowed(id));
        let wAdded = 0;

        // Add 1 special wolf if enough players
        if (count >= 7 && Math.random() > 0.5 && specialWolves.length > 0) {
            const w = specialWolves[Math.floor(Math.random() * specialWolves.length)];
            roles.push(w);
            wAdded++;
        }

        for (let i = wAdded; i < wolfCount; i++) {
            if (isAllowed('werewolf')) roles.push('werewolf');
        }

        // 2. Special Villagers
        ['seer', 'bodyguard'].forEach(r => { if (isAllowed(r)) roles.push(r); });

        if (count >= 6 && isAllowed('hunter')) roles.push('hunter');
        if (count >= 8 && isAllowed('witch')) roles.push('witch');
        if (count >= 9 && isAllowed('cupid')) roles.push('cupid');

        // 3. Fill
        while (roles.length < count) {
            if (isAllowed('villager')) {
                roles.push('villager');
            } else {
                // Fallback
                const allowedV = ROLES_CONFIG.filter(r => r.team === 'VILLAGER' && isAllowed(r.id)).map(r => r.id);
                if (allowedV.length > 0) {
                    roles.push(allowedV[Math.floor(Math.random() * allowedV.length)]);
                } else {
                    break;
                }
            }
        }
    }
    else if (difficulty === 'HARD') {
        // Pools (Filter all by allowed)
        const vHard = ['aura_seer', 'apprentice_seer', 'priest', 'tough_guy', 'lycan', 'diseased', 'old_woman', 'pacifist', 'revealer', 'spellcaster', 'troublemaker', 'pi', 'huntress', 'insomniac', 'mason'].filter(id => isAllowed(id));
        const wHard = ['sorceress', 'wolf_cub', 'dire_wolf', 'wolf_man', 'minion', 'lone_wolf'].filter(id => isAllowed(id));
        const solo = ['tanner', 'chupacabra', 'cult_leader', 'vampire', 'hoodlum', 'cursed', 'doppelganger', 'drunk'].filter(id => isAllowed(id));

        // 1. Wolves (High chance of special)
        for (let i = 0; i < wolfCount; i++) {
            if (Math.random() > 0.3 && wHard.length > 0) {
                roles.push(wHard[Math.floor(Math.random() * wHard.length)]);
            } else {
                if (isAllowed('werewolf')) roles.push('werewolf');
            }
        }

        // 2. Solo/Neutral (1-2 roles)
        if (count >= 6 && solo.length > 0) {
            roles.push(solo[Math.floor(Math.random() * solo.length)]);
        }
        if (count >= 10 && Math.random() > 0.5 && solo.length > 0) {
            roles.push(solo[Math.floor(Math.random() * solo.length)]);
        }

        // 3. Special Villagers (Fill remainder, minimal normal villagers)
        // Always 1 Seer-type
        const seers = ['seer', 'aura_seer', 'apprentice_seer'].filter(id => isAllowed(id));
        if (!roles.some(r => r.includes('seer')) && seers.length > 0) {
            roles.push(seers[Math.floor(Math.random() * seers.length)]);
        }

        while (roles.length < count) {
            // 80% Special
            if (Math.random() > 0.2 && vHard.length > 0) {
                const r = vHard[Math.floor(Math.random() * vHard.length)];
                // Mason must be pair? Let's skip mason logic for simple randomizer or handle it
                if (r === 'mason') {
                    // If not enough space for 2 or mason already exists, skip
                    if (roles.includes('mason') || roles.length >= count - 1) {
                        if (isAllowed('villager')) roles.push('villager');
                    } else {
                        roles.push('mason', 'mason');
                    }
                } else if (!roles.includes(r)) {
                    roles.push(r);
                } else {
                    if (isAllowed('villager')) roles.push('villager'); // Fallback on duplicate
                }
            } else {
                if (isAllowed('villager')) roles.push('villager');
            }
        }
    }

    // Fill up if under count (due to strict filtering)
    while (roles.length < count) {
        if (isAllowed('villager')) roles.push('villager');
        else if (isAllowed('werewolf')) roles.push('werewolf');
        else roles.push('villager'); // Last resort
    }

    // Trim excess (if Mason add caused overflow e.g.)
    if (roles.length > count) roles = roles.slice(0, count);

    currentProposedRoles = roles;
    renderProposedRoles();
}

function toggleCustomSelector() {
    const selector = document.getElementById('custom-role-selector');
    if (selector.style.display === 'none') {
        renderRoleSelector();
        selector.style.display = 'block';
    } else {
        selector.style.display = 'none';
    }
}

function renderRoleSelector() {
    const list = document.getElementById('custom-role-list');
    if (list.querySelectorAll('input').length > 0) return; // Already rendered

    list.innerHTML = ROLES_CONFIG.map(r => `
        <label style="display:flex; align-items:center; gap:5px; font-size:0.8rem; cursor:pointer;" title="${r.desc}">
            <input type="checkbox" value="${r.id}" checked>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.name.split('(')[0]}</span>
        </label>
    `).join('');
}

function toggleAllRoles(check) {
    document.querySelectorAll('#custom-role-list input[type="checkbox"]').forEach(cb => cb.checked = check);
}

function renderProposedRoles() {
    const container = document.getElementById('role-summary-list');
    const box = document.getElementById('role-summary-box');
    const btn = document.getElementById('apply-roles-btn');

    // Sort and count for display
    const sortedDetails = currentProposedRoles.map(rid => ROLES_CONFIG.find(x => x.id === rid) || { name: rid, icon: 'fa-question' });
    // Sort by team for niceness?
    sortedDetails.sort((a, b) => (a.team > b.team) ? 1 : -1);

    // Group
    const counts = {};
    sortedDetails.forEach(d => {
        counts[d.id] = (counts[d.id] || 0) + 1;
    });

    container.innerHTML = Object.entries(counts).map(([rid, num]) => {
        const rObj = ROLES_CONFIG.find(x => x.id === rid);
        const color = (!rObj) ? '#777' : (rObj.team.includes('WOLF') ? '#e74c3c' : (rObj.team === 'SOLO' || rObj.team === 'VAMPIRE' ? '#f1c40f' : '#3498db')); // Simple color coding logic
        const icon = rObj ? rObj.icon : 'fa-question';
        const name = rObj ? rObj.name.split('(')[0] : rid; // Shorten name

        return `<span style="background: rgba(0,0,0,0.3); padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; border: 1px solid ${color}; color: #ddd; display: flex; align-items: center; gap: 5px; white-space: nowrap;">
            <i class="fa-solid ${icon}" style="color: ${color}"></i> ${name} ${num > 1 ? '<span style="background:#fff; color:#000; border-radius:50%; min-width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; font-size:0.75em; padding:0 3px;">' + num + '</span>' : ''}
        </span>`;
    }).join('');

    box.style.display = 'block';
    btn.style.display = 'block';

    // Scroll to it
    box.scrollIntoView({ behavior: 'smooth' });
}

function applyRoles() {
    if (!currentProposedRoles || currentProposedRoles.length === 0) return;

    // Store the available roles for this round
    availableRolesForRound = [...currentProposedRoles];

    // Shuffle
    const shuffled = [...currentProposedRoles];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Assign
    players.forEach((p, index) => {
        if (shuffled[index]) p.roleId = shuffled[index];
    });

    renderPlayerRoster();
    // Flash message
    const btn = document.getElementById('apply-roles-btn');
    const originalText = btn.innerText;
    btn.innerText = "เรียบร้อย!";
    btn.style.backgroundColor = "#27ae60";
    setTimeout(() => {
        btn.innerText = "ใช้ชุดบทบาทนี้";
        btn.style.backgroundColor = "#34495e";
    }, 2000);
}

// Initialize
initSetup();

// --- MANUAL ROLE SELECTION MODE ---

function setRoleMode(mode) {
    roleSelectionMode = mode;

    const randomBtn = document.getElementById('mode-random-btn');
    const manualBtn = document.getElementById('mode-manual-btn');
    const randomUI = document.getElementById('random-mode-ui');
    const manualUI = document.getElementById('manual-mode-ui');

    if (mode === 'random') {
        randomBtn.style.background = 'rgba(78, 205, 196, 0.2)';
        randomBtn.style.borderColor = '#4ecdc4';
        randomBtn.style.color = '#4ecdc4';
        manualBtn.style.background = 'transparent';
        manualBtn.style.borderColor = 'var(--text-secondary)';
        manualBtn.style.color = 'var(--text-secondary)';

        randomUI.style.display = 'block';
        manualUI.style.display = 'none';
    } else {
        manualBtn.style.background = 'rgba(78, 205, 196, 0.2)';
        manualBtn.style.borderColor = '#4ecdc4';
        manualBtn.style.color = '#4ecdc4';
        randomBtn.style.background = 'transparent';
        randomBtn.style.borderColor = 'var(--text-secondary)';
        randomBtn.style.color = 'var(--text-secondary)';

        randomUI.style.display = 'none';
        manualUI.style.display = 'block';

        renderManualRoleSelector();
    }
}

function renderManualRoleSelector() {
    const villagerContainer = document.getElementById('manual-villager-roles');
    const wolfContainer = document.getElementById('manual-wolf-roles');
    const soloContainer = document.getElementById('manual-solo-roles');
    const mixedContainer = document.getElementById('manual-mixed-roles');

    villagerContainer.innerHTML = '';
    wolfContainer.innerHTML = '';
    soloContainer.innerHTML = '';
    mixedContainer.innerHTML = '';

    const villagerRoles = ROLES_CONFIG.filter(r => r.team === 'VILLAGER' && r.id !== 'cursed' && r.id !== 'doppelganger' && r.id !== 'drunk');
    const wolfRoles = ROLES_CONFIG.filter(r => r.team === 'WOLF' || r.team === 'WOLF_SOLO');
    const soloRoles = ROLES_CONFIG.filter(r => r.team === 'SOLO' || r.team === 'VAMPIRE');
    const mixedRoles = ROLES_CONFIG.filter(r => r.id === 'cursed' || r.id === 'doppelganger' || r.id === 'drunk');

    renderRoleGroup(villagerRoles, villagerContainer);
    renderRoleGroup(wolfRoles, wolfContainer);
    renderRoleGroup(soloRoles, soloContainer);
    renderRoleGroup(mixedRoles, mixedContainer);

    updateManualRoleCount();
}

function renderRoleGroup(roles, container) {
    roles.forEach(role => {
        const item = document.createElement('div');
        item.className = 'manual-role-item';
        item.innerHTML = `
            <label for="manual-${role.id}" title="${role.desc}">${role.name}</label>
            <input 
                type="number" 
                id="manual-${role.id}" 
                min="0" 
                max="10" 
                value="0"
                onchange="updateManualRoleCount()"
            >
        `;
        container.appendChild(item);
    });
}

function updateManualRoleCount() {
    const totalPlayersSpan = document.getElementById('total-players-needed');
    const totalRolesSpan = document.getElementById('total-roles-selected');
    const countDisplay = document.getElementById('role-count-display');

    // Use maxPlayers instead of players.length
    totalPlayersSpan.textContent = maxPlayers || 0;

    let totalSelected = 0;
    ROLES_CONFIG.forEach(role => {
        const input = document.getElementById(`manual-${role.id}`);
        if (input) {
            totalSelected += parseInt(input.value) || 0;
        }
    });

    totalRolesSpan.textContent = totalSelected;

    if (totalSelected === maxPlayers && totalSelected > 0) {
        countDisplay.classList.remove('invalid');
        countDisplay.classList.add('valid');
    } else {
        countDisplay.classList.remove('valid');
        countDisplay.classList.add('invalid');
    }
}

function generateManualRoles() {
    // Check if player count is set
    if (maxPlayers === 0) {
        alert('กรุณากรอกจำนวนผู้เล่นก่อน');
        return;
    }

    let roles = [];

    ROLES_CONFIG.forEach(role => {
        const input = document.getElementById(`manual-${role.id}`);
        if (input) {
            const count = parseInt(input.value) || 0;
            for (let i = 0; i < count; i++) {
                roles.push(role.id);
            }
        }
    });

    if (roles.length !== maxPlayers) {
        alert(`กรุณาเลือกบทบาทให้ครบ ${maxPlayers} บทบาท (ปัจจุบันเลือก ${roles.length} บทบาท)`);
        return;
    }

    const hasWolf = roles.some(roleId => {
        const role = ROLES_CONFIG.find(r => r.id === roleId);
        return role && (role.team === 'WOLF' || role.team === 'WOLF_SOLO');
    });

    if (!hasWolf) {
        alert("ต้องมีหมาป่าอย่างน้อย 1 ตัว!");
        return;
    }

    currentProposedRoles = selectedRoles;
    renderProposedRoles();

    document.getElementById('role-summary-box').scrollIntoView({ behavior: 'smooth' });
}

// --- NARRATOR VOICE SYSTEM ---

let narratorSpeech = null;
let narratorQueue = [];
let narratorIndex = 0;

function startNarration() {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
        alert('ขออภัย เบราว์เซอร์ของคุณไม่รองรับการอ่านเสียง');
        return;
    }

    // Stop any ongoing narration
    stopNarration();

    // Build narration queue based on current phase
    narratorQueue = [];
    narratorIndex = 0;

    if (gamePhase === 'NIGHT') {
        // Get active roles in the game
        const activeRoles = [...new Set(players.filter(p => p.isAlive).map(p => p.roleObj))];
        const nightSteps = activeRoles
            .filter(r => r.nightOrder > 0)
            .sort((a, b) => a.nightOrder - b.nightOrder);

        if (nightSteps.length === 0) {
            alert('ไม่มีบทบาทที่ต้องตื่นในคืนนี้');
            return;
        }

        // Opening
        narratorQueue.push({
            text: 'ทุกคนหลับตา. ตอนนี้เป็นเวลากลางคืน',
            display: '🌙 ทุกคนหลับตา',
            type: 'opening'
        });

        // Add each role's turn
        nightSteps.forEach((role, index) => {
            const playersWithRole = players.filter(p => p.isAlive && p.roleObj.id === role.id);
            const playerNames = playersWithRole.map(p => p.name).join(' และ ');

            let instruction = '';

            // Custom instructions for each role
            switch (role.id) {
                case 'cupid':
                    instruction = 'ตื่นขึ้นและเลือกคู่รัก 2 คน';
                    break;
                case 'beholder':
                    instruction = 'ตื่นขึ้นเพื่อดูว่าใครเป็นผู้หยั่งรู้';
                    break;
                case 'mason':
                    instruction = 'ตื่นขึ้นและจำหน้ากัน';
                    break;
                case 'doppelganger':
                    instruction = 'ตื่นขึ้นและเลือกคนที่จะเลียนแบบ';
                    break;
                case 'hoodlum':
                    instruction = 'ตื่นขึ้นและเลือกเป้าหมาย';
                    break;
                case 'bodyguard':
                    instruction = 'ตื่นขึ้นและเลือกคนที่จะปกป้อง';
                    break;
                case 'priest':
                    instruction = 'ตื่นขึ้นและเลือกคนที่จะมอบพร';
                    break;
                case 'troublemaker':
                    instruction = 'ตื่นขึ้นและเลือกใช้พลังหรือไม่';
                    break;
                case 'cursed':
                case 'werewolf':
                case 'wolf_cub':
                case 'wolf_man':
                case 'dire_wolf':
                case 'lone_wolf':
                    instruction = 'หมาป่าทั้งหมดตื่นขึ้นและเลือกเหยื่อ';
                    break;
                case 'minion':
                    instruction = 'ตื่นขึ้นเพื่อดูว่าใครเป็นหมาป่า';
                    break;
                case 'witch':
                    instruction = 'ตื่นขึ้น ดูเหยื่อ และเลือกใช้ยาหรือไม่';
                    break;
                case 'seer':
                    instruction = 'ตื่นขึ้นและเลือกดูบทบาทของใครสักคน';
                    break;
                case 'aura_seer':
                    instruction = 'ตื่นขึ้นและเลือกดูออร่าของใครสักคน';
                    break;
                case 'apprentice_seer':
                    instruction = 'ตื่นขึ้นพร้อมผู้หยั่งรู้';
                    break;
                case 'pi':
                    instruction = 'ตื่นขึ้นและเลือกดูว่ามีหมาป่าอยู่ใกล้ๆ หรือไม่';
                    break;
                case 'sorceress':
                    instruction = 'ตื่นขึ้นและเลือกดูว่าใครเป็นผู้หยั่งรู้';
                    break;
                case 'cult_leader':
                    instruction = 'ตื่นขึ้นและชวนคนเข้าลัทธิ';
                    break;
                case 'chupacabra':
                    instruction = 'ตื่นขึ้นและเลือกเหยื่อ';
                    break;
                case 'vampire':
                    instruction = 'ตื่นขึ้นและเลือกเหยื่อ';
                    break;
                case 'huntress':
                    instruction = 'ตื่นขึ้นและเลือกใช้ความสามารถหรือไม่';
                    break;
                case 'revealer':
                    instruction = 'ตื่นขึ้นและเลือกเปิดเผยตัวตนของใครสักคน';
                    break;
                case 'old_woman':
                    instruction = 'ตื่นขึ้นและเลือกไล่คนออกจากเมือง';
                    break;
                case 'spellcaster':
                    instruction = 'ตื่นขึ้นและเลือกใบ้ใครสักคน';
                    break;
                case 'insomniac':
                    instruction = 'ตื่นขึ้นเพื่อดูว่าคนข้างๆ ตื่นหรือไม่';
                    break;
                case 'drunk':
                    instruction = 'ตื่นขึ้นเพื่อดูบทบาทที่แท้จริง';
                    break;
                default:
                    instruction = 'ตื่นขึ้นและใช้ความสามารถ';
            }

            narratorQueue.push({
                text: `${role.name} ${playerNames ? playerNames : ''} ${instruction}`,
                display: `${role.name} - ${instruction}`,
                type: 'role',
                roleName: role.name
            });

            // Check if current role is a wolf role
            const isWolfRole = ['werewolf', 'wolf_cub', 'wolf_man', 'dire_wolf', 'cursed', 'lone_wolf'].includes(role.id);

            // Check if next role is also a wolf role
            const nextRole = nightSteps[index + 1];
            const nextIsWolfRole = nextRole && ['werewolf', 'wolf_cub', 'wolf_man', 'dire_wolf', 'cursed', 'lone_wolf'].includes(nextRole.id);

            // Add sleep command
            if (isWolfRole) {
                // If this is a wolf role and next role is NOT a wolf role (or no next role), add wolves sleep
                if (!nextIsWolfRole) {
                    narratorQueue.push({
                        text: 'หมาป่าหลับตา',
                        display: 'หมาป่าหลับตา',
                        type: 'sleep'
                    });
                }
            } else {
                // For non-wolf roles, add individual sleep command
                narratorQueue.push({
                    text: `${role.name} หลับตา`,
                    display: `${role.name} หลับตา`,
                    type: 'sleep'
                });
            }
        });

        // Closing
        narratorQueue.push({
            text: 'ทุกคนตื่นขึ้น. ตอนนี้เป็นเวลากลางวัน',
            display: '☀️ ทุกคนตื่นขึ้น - กลางวัน',
            type: 'closing'
        });

    } else {
        // DAY phase narration
        narratorQueue.push({
            text: 'ตอนนี้เป็นเวลากลางวัน. ให้ทุกคนอภิปรายและโหวตประหารผู้ต้องสงสัย',
            display: '☀️ เวลาอภิปรายและโหวต',
            type: 'day'
        });
    }

    // Start narration with manual control
    document.getElementById('narration-playback').style.display = 'flex';
    document.getElementById('narrate-btn').style.display = 'none';
    updateNarrationProgress();
    speakCurrent();
}

function speakCurrent() {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    if (narratorIndex >= narratorQueue.length) {
        stopNarration();
        return;
    }

    const item = narratorQueue[narratorIndex];
    const progressText = `(${narratorIndex + 1}/${narratorQueue.length})`;
    document.getElementById('current-narration').innerHTML = `<i class=\"fa-solid fa-volume-high\" style=\"margin-right: 5px;\"></i>${item.display} <span style=\"opacity: 0.6; font-size: 0.8em;\">${progressText}</span>`;

    narratorSpeech = new SpeechSynthesisUtterance(item.text);
    narratorSpeech.lang = 'th-TH';
    narratorSpeech.rate = 0.9;
    narratorSpeech.pitch = 1.0;
    narratorSpeech.volume = 1.0;

    narratorSpeech.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        // Don't stop on error, just log it
    };

    window.speechSynthesis.speak(narratorSpeech);
    updateNarrationProgress();
}

function nextNarration() {
    narratorIndex++;
    speakCurrent();
}

function previousNarration() {
    if (narratorIndex > 0) {
        narratorIndex--;
        speakCurrent();
    }
}

function updateNarrationProgress() {
    const prevBtn = document.getElementById('prev-narrate-btn');
    const nextBtn = document.getElementById('next-narrate-btn');

    // Show/hide previous button
    if (narratorIndex > 0) {
        prevBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
    }

    // Update next button text
    if (narratorIndex >= narratorQueue.length - 1) {
        nextBtn.innerHTML = '<i class="fa-solid fa-check"></i> เสร็จสิ้น';
    } else {
        nextBtn.innerHTML = '<i class="fa-solid fa-forward"></i> ถัดไป';
    }
}

function stopNarration() {
    // Cancel speech synthesis safely
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    narratorSpeech = null;
    narratorQueue = [];
    narratorIndex = 0;

    document.getElementById('narration-playback').style.display = 'none';
    document.getElementById('narrate-btn').style.display = 'block';
    document.getElementById('current-narration').innerHTML = '';
}

