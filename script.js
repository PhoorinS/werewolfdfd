// Game State
let players = [];
let gamePhase = 'SETUP'; // SETUP, NIGHT, DAY
let time = 300; // 5 minutes default
let timerInterval = null;

// Configurable Roles (Thai Translations)
const ROLES_CONFIG = [
    // --- Villager Team (ฝ่ายชาวบ้าน) ---
    { id: 'apprentice_seer', name: 'Apprentice Seer (ผู้หยั่งรู้ฝึกหัด)', icon: 'fa-graduation-cap', desc: 'จะกลายเป็น Seer แทนเมื่อ Seer ตาย และตื่นพร้อม Seer ทุกคืน', nightOrder: 42, team: 'VILLAGER' },
    { id: 'aura_seer', name: 'Aura Seer (ผู้หยั่งรู้ออร่า)', icon: 'fa-eye-low-vision', desc: 'ชี้ผู้เล่นเพื่อดูว่าเป็น Villager/Wolf ธรรมดาหรือไม่ (คว่ำ=ธรรมดา, ชู=พิเศษ)', nightOrder: 41, team: 'VILLAGER' },
    { id: 'beholder', name: 'Beholder (ผู้เฝ้ามอง)', icon: 'fa-binoculars', desc: 'คืนแรกจะรู้ว่าใครเป็น Seer (แนะนำให้ Seer ชูนิ้วโป้งให้ดู)', nightOrder: 2, team: 'VILLAGER' },
    { id: 'bodyguard', name: 'Bodyguard (บอดี้การ์ด)', icon: 'fa-shield-halved', desc: 'ปกป้องคนได้ 1 คนต่อคืน (ห้ามซ้ำ, ห้ามกันตัวเอง) คนที่โดนปกป้องจะไม่ตาย', nightOrder: 10, team: 'VILLAGER' },
    { id: 'cupid', name: 'Cupid (คิวปิด)', icon: 'fa-heart', desc: 'เลือก 2 คนเป็นคู่รัก (ถ้าคนนึงตาย อีกคนตายด้วย) ถ้าอยู่คนละฝ่ายจะเป็นทีมใหม่ชนะเมื่อเหลือ 2 คนสุดท้าย', nightOrder: 1, team: 'VILLAGER' },
    { id: 'diseased', name: 'Diseased (ผู้ติดโรค)', icon: 'fa-biohazard', desc: 'ถ้าโดนหมาป่าฆ่า คืนถัดไปหมาป่าจะฆ่าใครไม่ได้ (Mod ประกาศตอนเช้า)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'hunter', name: 'Hunter (นายพราน)', icon: 'fa-crosshairs', desc: 'ถ้าถูกฆ่าตอนกลางคืน ตอนเช้าจะได้เลือกยิง 1 คน (Mod ประกาศการตาย)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'huntress', name: 'Huntress (พรานหญิง)', icon: 'fa-person-rifle', desc: 'ตื่นทุกคืนเพื่อเลือกใช้ความสามารถสังหาร 1 คน (Mod ต้องเรียกทุกคืนจนกว่าจะใช้)', nightOrder: 62, team: 'VILLAGER' },
    { id: 'insomniac', name: 'Insomniac (หน่องนอนไม่หลับ)', icon: 'fa-bed', desc: 'รู้ว่าคนนั่งข้างซ้าย/ขวาตื่นหรือไม่ (Mod ชูนิ้ว=ตื่น)', nightOrder: 90, team: 'VILLAGER' },
    { id: 'lycan', name: 'Lycan (ลูกครึ่งหมา)', icon: 'fa-dog', desc: 'ฝ่ายชาวบ้าน แต่ Seer จะเห็นเป็นหมาป่า', nightOrder: 0, team: 'VILLAGER' },
    { id: 'mason', name: 'Mason (กลุ่มภราดรภาพ)', icon: 'fa-trowel-bricks', desc: 'คืนแรกลืมตามาจำหน้ากัน ห้ามใครพูดถึง Mason ไม่งั้นคืนถัดไปตาย (นับว่าแพ้)', nightOrder: 3, team: 'VILLAGER' },
    { id: 'old_woman', name: 'Old Woman (หญิงแก่)', icon: 'fa-person-cane', desc: 'ทุกคืนเลือกไล่คนออกจากเมือง 1 วัน (ห้ามพูด/โหวต/โดนฆ่า) ห้ามเลือกซ้ำ/ตัวเอง', nightOrder: 81, team: 'VILLAGER' },
    { id: 'pacifist', name: 'Pacifist (ผู้รักสงบ)', icon: 'fa-peace', desc: 'ห้ามโหวตประหารใคร (ถ้าให้สนุก Mod อย่าบอกว่ามีบทนี้)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'pi', name: 'Paranormal Investigator (คนอวดผี)', icon: 'fa-magnifying-glass', desc: 'ชี้คนเพื่อดูว่าเขาหรือคนข้างๆ เป็นหมาป่าไหม (ชู=มี, คว่ำ=ไม่มี) ไม่บอกจำนวน', nightOrder: 43, team: 'VILLAGER' },
    { id: 'priest', name: 'Priest (บาทหลวง)', icon: 'fa-cross', desc: 'เลือกมอบพรให้คน 1 ครั้ง เพื่อกันตายได้ 1 ครั้ง (แม้ Priest ตายพรก็ยังอยู่)', nightOrder: 11, team: 'VILLAGER' },
    { id: 'prince', name: 'Prince (เจ้าชาย)', icon: 'fa-crown', desc: 'ถ้าถูกโหวตประหาร จะไม่ตายแต่ต้องเปิดเผยโรลและจบวันทันที (แต่โดนฆ่ากลางคืนตายปกติ)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'revealer', name: 'Revealer (ผู้เปิดเผยตัวตน)', icon: 'fa-clapperboard', desc: 'เลือก 1 คน ถ้าเป็นหมาป่า(รวม Lycan) มันตาย ถ้าไม่ใช่ เราตาย', nightOrder: 63, team: 'VILLAGER' },
    { id: 'seer', name: 'Seer (ผู้หยั่งรู้)', icon: 'fa-eye', desc: 'ชี้คนเพื่อดูว่าเป็นหมาป่าไหม (ชู=ใช่, คว่ำ=ไม่ใช่) บทอื่นๆ เช่น Vampire/Minion นับว่าไม่ใช่', nightOrder: 40, team: 'VILLAGER' },
    { id: 'spellcaster', name: 'Spellcaster (ผู้ร่ายเวท)', icon: 'fa-wand-magic-sparkles', desc: 'เลือกใบ้ 1 คน ห้ามพูด/เสนอ/โหวต ในเช้าถัดไป (Mod ต้องประกาศคนโดน)', nightOrder: 80, team: 'VILLAGER' },
    { id: 'tough_guy', name: 'Tough Guy (หนุ่มบึ้ก)', icon: 'fa-dumbbell', desc: 'ถ้าโดนหมาป่าฆ่า จะยังไม่ตายจนกว่าจะเช้าถัดไป', nightOrder: 0, team: 'VILLAGER' },
    { id: 'troublemaker', name: 'Trouble Maker (ผู้สร้างปัญหา)', icon: 'fa-shuffle', desc: 'เลือกใช้พลังทำให้วันถัดไปต้องโหวตประหาร 2 คน', nightOrder: 15, team: 'VILLAGER' },
    { id: 'villager_idiot', name: 'Villager Idiot (ชาวบ้านผู้โง่เง่า)', icon: 'fa-face-grin-tongue-wink', desc: 'ต้องโหวตประหารใครสักคนทุกเช้า (ถ้าให้สนุก Mod อย่าบอกว่ามีบทนี้)', nightOrder: 0, team: 'VILLAGER' },
    { id: 'villager', name: 'Villager (ชาวบ้านธรรมดา)', icon: 'fa-user', desc: 'ช่วยกันจับผิดและโหวตประหาร', nightOrder: 0, team: 'VILLAGER' },
    { id: 'witch', name: 'Witch (แม่มด)', icon: 'fa-hat-wizard', desc: 'มียาฆ่า/ยาช่วยอย่างละขวด รู้ว่าใครกำลังจะโดนฆ่า(Mod ชี้ให้ดู)', nightOrder: 30, team: 'VILLAGER' },

    // --- Self Team (ฝ่ายตัวเอง) ---
    { id: 'chupacabra', name: 'Chupacabra (ชูปากาบรัส)', icon: 'fa-dragon', desc: 'เลือกฆ่า 1 คน ถ้าเป็นหมาป่า หมาป่าตาย (ถ้าหมาป่าหมดแล้วฆ่าใครก็ได้) ชนะเมื่อเหลือคนเดียว', nightOrder: 60, team: 'SOLO' },
    { id: 'cult_leader', name: 'Cult Leader (ผู้นำลัทธิ)', icon: 'fa-users-rays', desc: 'ชวนคนเข้าลัทธิทุกคืน ชนะเมื่อทุกคนอยู่ในลัทธิ (ถ้าเราตายลัทธิล่ม)', nightOrder: 55, team: 'SOLO' },
    { id: 'hoodlum', name: 'Hoodlum (อันธพาล)', icon: 'fa-hand-fist', desc: 'คืนแรกเลือกคนตามจำนวนหมาป่า ถ้าคนเหล่านั้นตายก่อนเรา เราชนะ', nightOrder: 4, team: 'SOLO' },
    { id: 'lone_wolf', name: 'Lone Wolf (หมาป่าเดียวดาย)', icon: 'fa-wolf-pack-battalion', desc: 'ตื่นพร้อมหมาป่า ชนะเมื่อเหลือคนสุดท้ายหรือเหลือเหยื่อ 1 คน', nightOrder: 20, team: 'WOLF_SOLO' },
    { id: 'tanner', name: 'Tanner (ยาจก)', icon: 'fa-hand-holding-dollar', desc: 'ชนะเมื่อถูกโหวตประหารเท่านั้น', nightOrder: 0, team: 'SOLO' },
    { id: 'vampire', name: 'Vampire (แวมไพร์)', icon: 'fa-tooth', desc: 'เลือกเหยื่อ 1 คน เหยื่อจะตายถ้าถูกเสนอชื่อโหวตอีกในเช้าถัดมา (Vampire หมาป่าฆ่าไม่ตาย)', nightOrder: 61, team: 'VAMPIRE' },

    // --- Half/Mixed (ครึ่งคนครึ่งร้าย) ---
    { id: 'cursed', name: 'Cursed (ผู้โดนสาป)', icon: 'fa-book-skull', desc: 'อยู่ทีมชาวบ้าน จนกว่าจะโดนหมาป่าฆ่าจะกลายเป็นหมาป่า (ตื่นพร้อมหมาป่าทุกคืน แม้ยังไม่เปลี่ยน)', nightOrder: 19, team: 'VILLAGER' },
    { id: 'doppelganger', name: 'Doppelganger (ด็อพเพิลเก็งเงอร์)', icon: 'fa-masks-theater', desc: 'คืนแรกเลือก 1 คน ถ้าเขาตายเราสวมบทแทน (อยู่ทีมชาวบ้านจนกว่าจะสวมบท)', nightOrder: 5, team: 'VILLAGER' },
    { id: 'drunk', name: 'Drunk (คนเมา)', icon: 'fa-wine-bottle', desc: 'ไม่รู้บทตัวเองจนคืนที่ 3 (สุ่มหยิบการ์ด)', nightOrder: 100, team: 'VILLAGER' },

    // --- Wolf Team (ฝ่ายหมาป่า) ---
    { id: 'dire_wolf', name: 'Dire Wolf (หมาป่าโลกันตร์)', icon: 'fa-link', desc: 'เลือก 1 สหาย ถ้าเขาตายเราตายด้วย (ถ้าเราตายสหายไม่ตาย)', nightOrder: 21, team: 'WOLF' },
    { id: 'minion', name: 'Minion (ลูกสมุน)', icon: 'fa-mask', desc: 'รู้ว่าใครเป็นหมาป่า แต่หมาป่าไม่รู้เรา ช่วยปั่นชาวบ้าน', nightOrder: 22, team: 'WOLF' },
    { id: 'sorceress', name: 'Sorceress (แม่มดร้าย)', icon: 'fa-hat-witch', desc: 'เลือกดูว่าใครเป็น Seer (ชู=ใช่, คว่ำ=ไม่ใช่) ไม่รู้ว่าใครเป็นหมาป่า', nightOrder: 44, team: 'WOLF' },
    { id: 'werewolf', name: 'Werewolf (หมาป่าธรรมดา)', icon: 'fa-wolf-pack-battalion', desc: 'ตื่นมาโหวตฆ่า (ห้ามฆ่ากันเอง)', nightOrder: 20, team: 'WOLF' },
    { id: 'wolf_cub', name: 'Wolf Cub (ลูกหมาป่า)', icon: 'fa-paw', desc: 'ถ้าตาย คืนถัดไปหมาป่าฆ่าได้ 2 คน', nightOrder: 20, team: 'WOLF' },
    { id: 'wolf_man', name: 'Wolf Man (มนุษย์หมาป่า)', icon: 'fa-people-arrows', desc: 'บทบาทที่หาหมาป่าจะเห็นเราเป็นชาวบ้าน', nightOrder: 20, team: 'WOLF' }
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
        isAlive: true,
        isLover: false
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
        p.isLover = false; // Reset lover status
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
    const hasCupid = players.some(p => p.roleObj.id === 'cupid');
    const loverCount = players.filter(p => p.isLover).length;

    activePlayersList.innerHTML = players.map(p => `
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
        alert("⚠️ Tough Guy! ยังไม่ตายทันที ไปตายตอนเช้าวันถัดไป (Moderator อย่าเพิ่งประกาศตาย)");
    }
    if (p.roleObj.id === 'cursed' && gamePhase === 'NIGHT') {
        alert("⚠️ Cursed! ถ้าโดนหมาป่าฆ่า ให้เปลี่ยนฝ่ายเป็นหมาป่าแทนการตาย! (ชูนิ้วบอกเขา)");
        return; // Moderator manual handle
    }
    if (p.roleObj.id === 'huntress' && gamePhase === 'NIGHT') {
        alert("⚠️ Huntress! หมาป่าฆ่าไม่ได้ (ยกเว้นโดนยาพิษแม่มด)");
    }
    if (p.roleObj.id === 'diseased' && gamePhase === 'NIGHT') {
        alert("⚠️ Diseased ตาย! คืนถัดไปหมาป่าจะฆ่าใครไม่ได้ (Mod ต้องประกาศตอนเช้า)");
    }
    if (p.roleObj.id === 'vampire') {
        alert("⚠️ Vampire! ถ้าโดนโหวตตอนเช้า จะยังไม่ตาย ต้องโดนโหวตอีกครั้งในเช้าถัดไป (ยกเว้นโดนล่าจากบทอื่น)");
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

        // 1. TANNER WIN
        if (p.roleObj.id === 'tanner' && gamePhase === 'DAY') {
            announceWinner('ฝ่าย Tanner (ชนะแล้ว!)');
            return;
        }

        // 2. CHECK WIN CONDITIONS
        checkWinCondition();

        // 3. POST-DEATH ALERTS
        if (p.roleObj.id === 'hunter') {
            alert("🔫 Hunter ตาย! ให้เขาเลือกยิง 1 คนทันที");
        }
        if (p.roleObj.id === 'wolf_cub') {
            alert("🐺 Wolf Cub ตาย! คืนพรุ่งนี้หมาป่าฆ่าได้ 2 ศพ");
        }
        if (p.roleObj.id === 'prince' && gamePhase === 'DAY') {
            alert("👑 Prince ถูกโหวต! ไม่ตายแต่ต้องเปิดการ์ดโชว์");
            p.isAlive = true; // Revive immediately as logic dictates he doesn't die
            renderGameList();
        }
        if (p.roleObj.id === 'old_woman') {
            alert("👵 Old Woman ตาย! การไล่คนออกจากเมืองสิ้นสุดลง");
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

    // 1. Chupacabra Win (Alone)
    const chupa = alive.find(p => p.roleObj.id === 'chupacabra');
    if (chupa && alive.length === 1) {
        announceWinner('Chupacabra (Wins Alone!)');
        return;
    }

    // 2. Lone Wolf Win (Last Wolf)
    const lone = alive.find(p => p.roleObj.id === 'lone_wolf');
    if (lone && wolfCount === 1 && alive.length === 1) {
        announceWinner('Lone Wolf (Wins Alone!)');
        return;
    }

    // 3. White Wolf Win (Alone)
    const white = alive.find(p => p.roleObj.id === 'white_wolf');
    if (white && alive.length === 1) {
        announceWinner('White Wolf (Wins Alone!)');
        return;
    }

    // 4. Cult Leader (All alive are cult? Hard to track automatically without Cult status. Omitted for manual check)
    // 5. Hoodlum (Target check omitted, manual)

    // 6. Good vs Evil Standard
    // Villager Win: No bad guys
    if (wolfCount === 0 && vampCount === 0 && soloCount === 0) {
        announceWinner('ฝ่ายชาวบ้าน (Villager Team)');
        return;
    }

    // Werewolf Win: Wolves >= Non-Wolves
    // (Note: Strictly standard rules say Wolves win when equal to Villagers)
    const nonWolves = alive.length - wolfCount;
    if (vampCount === 0 && soloCount === 0 && wolfCount > 0 && wolfCount >= nonWolves) {
        announceWinner('ฝ่ายหมาป่า (Werewolf Team)');
        return;
    }

    // Vampire Win
    const nonVamps = alive.length - vampCount;
    if (wolfCount === 0 && soloCount === 0 && vampCount > 0 && vampCount >= nonVamps) {
        announceWinner('ฝ่ายแวมไพร์ (Vampire Team)');
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
