/* ============================================================
   HYPERSCALE — Compute Empire
   Category-based facilities, leveled tech tree, automated contracts,
   rare materials — built for long-term, idle-friendly progression.
   ============================================================ */

'use strict';

/* ================= CONFIG ================= */

const SAVE_KEY = 'hyperscale_save_v2';

const CATEGORIES = {
  power:    { name:'Power',        icon:'⚡', unit:'MW', desc:'Electricity capacity. Every other facility draws from it.' },
  cpu:      { name:'CPU Compute',  icon:'▦', unit:'PF', desc:'General-purpose compute — Inference & Storage contracts.' },
  gpu:      { name:'GPU Compute',  icon:'▥', unit:'PF', desc:'AI training compute — the highest-paying contracts need this.' },
  storage:  { name:'Storage',      icon:'▤', unit:'TB', desc:'Data storage capacity, sold via Storage contracts.' },
  cooling:  { name:'Cooling',      icon:'❄', unit:'', desc:'Lowers PUE and prevents overheating penalties.' },
  security: { name:'Security',     icon:'▧', unit:'', desc:'Defends the campus against cyberattacks.' },
  rnd:      { name:'R&D',          icon:'✦', unit:'RP/d', desc:'Generates research points to spend on the tech tree.' },
  supply:   { name:'Supply Chain', icon:'📦', unit:'', desc:'Sources the rare alloys advanced hardware needs. Unlocks with research.' },
};
const CATEGORY_ORDER = ['power','cpu','gpu','storage','cooling','security','rnd','supply'];

const BUILDING_DEFS = {
  // --- Power ---
  solar:   { category:'power', tier:1, name:'Solar Farm',   icon:'☀', cost:3000,  power:8,  upkeep:17,  desc:'Clean, quiet power. Not much of it, but reliable.' },
  gas:     { category:'power', tier:1, name:'Gas Turbine',  icon:'🔥', cost:8000,  power:26, upkeep:125, repPerDay:-0.03, desc:'Fast, heavy power. Bad for your public image.' },
  nuclear: { category:'power', tier:2, name:'Nuclear Reactor', icon:'☢', cost:120000, power:150, upkeep:480, rareCost:15, requiresTech:'nuclearProgram', desc:'Enormous, clean power output. The backbone of a real hyperscaler.' },
  fusionCore: { category:'power', tier:3, name:'Fusion Core', icon:'🌟', cost:2400000, power:900, upkeep:2600, rareCost:120, coreCost:14, requiresTech:'fusionCoreProgram', desc:'A star in a bottle. Power output on a different scale entirely.' },
  // --- CPU ---
  cpuRack:      { category:'cpu', tier:1, name:'CPU Rack',          icon:'▦', cost:5000,  compute:10, powerUse:6,  upkeep:35,  desc:'General-purpose compute for Inference and Storage contracts.' },
  neuromorphic: { category:'cpu', tier:2, name:'Neuromorphic Array', icon:'🧠', cost:150000, compute:65, powerUse:26, upkeep:495, rareCost:18, requiresTech:'neuromorphicComputing', desc:'Brain-inspired chips — huge CPU throughput per watt.' },
  photonicMesh: { category:'cpu', tier:3, name:'Photonic Mesh', icon:'💫', cost:2600000, compute:340, powerUse:120, upkeep:2800, rareCost:130, coreCost:15, requiresTech:'photonicMeshProgram', desc:'Light-speed interconnects. CPU compute like nothing else on the market.' },
  // --- GPU ---
  gpuCluster:  { category:'gpu', tier:1, name:'GPU Cluster',        icon:'▥', cost:15000, compute:15, powerUse:20, upkeep:98,  desc:'The resource everyone wants: AI model training.' },
  quantumAccel:{ category:'gpu', tier:2, name:'Quantum Accelerator', icon:'🔮', cost:220000, compute:95, powerUse:58, upkeep:760, rareCost:25, requiresTech:'quantumAccelerators', desc:'Qubit-assisted training. The best GPU money can buy.' },
  singularityArray: { category:'gpu', tier:3, name:'Singularity Array', icon:'🌌', cost:3200000, compute:420, powerUse:160, upkeep:3400, rareCost:150, coreCost:18, requiresTech:'singularityArrayProgram', desc:'The theoretical ceiling of GPU compute. Trains models nobody else can.' },
  // --- Storage ---
  storageVault: { category:'storage', tier:1, name:'Storage Vault',       icon:'▤', cost:4000, storage:50, powerUse:3, upkeep:23, desc:'Hot & cold storage capacity for data contracts.' },
  holoArchive:  { category:'storage', tier:2, name:'Holographic Archive', icon:'💠', cost:100000, storage:420, powerUse:15, upkeep:380, rareCost:12, requiresTech:'holographicStorage', desc:'Crystal-lattice storage at massive density.' },
  dimensionalVault: { category:'storage', tier:3, name:'Dimensional Vault', icon:'🔷', cost:2200000, storage:2600, powerUse:110, upkeep:2500, rareCost:110, coreCost:13, requiresTech:'dimensionalVaultProgram', desc:'Storage that folds space to fit more than it should. Nobody fully understands how.' },
  // --- Cooling ---
  coolingUnit: { category:'cooling', tier:1, name:'Cooling Unit',       icon:'❄', cost:6000, powerUse:5,  upkeep:40,  coolingPower:1, desc:'Lowers PUE and prevents the campus from overheating.' },
  cryoCooling: { category:'cooling', tier:2, name:'Cryo-Cooling Array', icon:'🧊', cost:110000, powerUse:21, upkeep:450, coolingPower:5, rareCost:14, requiresTech:'cryoCooling', desc:'Near-absolute-zero cooling for maximum efficiency.' },
  zeroPointField: { category:'cooling', tier:3, name:'Zero-Point Field', icon:'❇️', cost:2100000, powerUse:95, upkeep:2400, coolingPower:22, rareCost:105, coreCost:12, requiresTech:'zeroPointProgram', desc:'Cooling drawn from vacuum energy. PUE stops being a concern at all.' },
  // --- Security ---
  securityHub: { category:'security', tier:1, name:'Security Hub',    icon:'▧', cost:5000, powerUse:4,  upkeep:46,  defensePower:1, desc:'Reduces the impact of cyberattacks on the campus.' },
  aiSentinel:  { category:'security', tier:2, name:'AI Sentinel Grid', icon:'🛡', cost:130000, powerUse:19, upkeep:495, defensePower:5, rareCost:16, requiresTech:'aiSentinel', desc:'Autonomous threat-hunting AI defense grid.' },
  quantumShield: { category:'security', tier:3, name:'Quantum Encryption Shield', icon:'🔐', cost:2100000, powerUse:100, upkeep:2400, defensePower:22, rareCost:105, coreCost:12, requiresTech:'quantumShieldProgram', desc:'Encryption tied to quantum states. Effectively unbreakable.' },
  // --- R&D ---
  rndLab:     { category:'rnd', tier:1, name:'R&D Lab',    icon:'✦', cost:7000, powerUse:5,  upkeep:58,  researchPerDay:2, desc:'Continuously generates research points.' },
  quantumLab: { category:'rnd', tier:2, name:'Quantum Lab', icon:'🔬', cost:140000, powerUse:23, upkeep:540, researchPerDay:9, rareCost:20, requiresTech:'quantumLab', desc:'Research at the frontier of physics.' },
  singularityThinkTank: { category:'rnd', tier:3, name:'Singularity Think Tank', icon:'🧬', cost:2500000, powerUse:130, upkeep:2700, researchPerDay:40, rareCost:125, coreCost:16, requiresTech:'thinkTankProgram', desc:'A research team that never sleeps, augmented past human limits.' },
  // --- Supply Chain ---
  salvageYard:  { category:'supply', tier:1, name:'Salvage Yard',        icon:'🏭', cost:20000, powerUse:8,  upkeep:105,  rarePerDay:0.4, desc:'Recovers rare alloys from decommissioned hardware.' },
  orbitalMiner: { category:'supply', tier:2, name:'Orbital Mining Array', icon:'🛰', cost:300000, powerUse:36, upkeep:1035, rarePerDay:2.4, requiresTech:'orbitalMining', desc:'Automated drones feed rare alloys straight into your supply chain.' },
  fabricationComplex: { category:'supply', tier:3, name:'Fabrication Complex', icon:'⚙️', cost:1800000, powerUse:140, upkeep:2200, alloyConsumePerDay:3, coreOutPerDay:0.22, requiresTech:'fabricationProgram', desc:'Refines rare alloys into Singularity Cores — slow, but nothing else can make them.' },
};

const BUILDING_TIER_LABEL = { 1:'Standard', 2:'Advanced', 3:'Singularity' };

const STAFF_TYPES = {
  technician: { name:'Technician',      cost:1000, costGrowth:1.15, salary:70,  desc:'Softens the severity of outages and heatwaves when they hit.' },
  scientist:  { name:'Data Scientist',  cost:2000, costGrowth:1.16, salary:130, desc:'Improves compute efficiency and generates research.' },
  sales:      { name:'Sales Rep',       cost:1200, costGrowth:1.15, salary:90,  desc:'Attracts more contracts, and better ones.' },
  security:   { name:'Security Guard',  cost:1500, costGrowth:1.15, salary:75,  desc:'Reduces the likelihood and impact of a cyberattack.' },
  manager:    { name:'Account Manager', cost:3000, costGrowth:1.2,  salary:150, desc:'Automatically accepts fitting contracts for you — no clicking required. More managers = faster pace.' },
};

function staffHireCost(type){
  const def = STAFF_TYPES[type];
  return Math.round(def.cost * Math.pow(def.costGrowth, state.staff[type]));
}

function technicianMitigation(s){ return Math.min(0.6, s.staff.technician*0.08); }

/* Tech tree: "level" techs are bought repeatedly for a scaling bonus (the long-term
   cash/research sink). "unlock" techs are one-off gates that unlock a tier-2 building —
   they always cost research AND rare alloys, since they represent a rare breakthrough. */
const TECH_TREE = [
  { id:'liquidCooling',    kind:'level', name:'Liquid Cooling',       maxLevel:8, baseCost:12, growth:1.5,  requires:[], desc:lvl=>`-${Math.min(28,Math.round((lvl+1)*3.5))}% power consumption across all compute (currently -${Math.round(lvl*3.5)}%).` },
  { id:'nextGenGPU',       kind:'level', name:'Next-Gen GPUs',        maxLevel:6, baseCost:20, growth:1.6,  requires:[], desc:lvl=>`+${Math.round((lvl+1)*9)}% compute output from GPU Clusters (currently +${Math.round(lvl*9)}%).` },
  { id:'renewableSubsidy', kind:'level', name:'Renewable Subsidy',    maxLevel:6, baseCost:16, growth:1.55, requires:[], desc:lvl=>`-${Math.round((lvl+1)*6)}% Solar build cost, +${Math.round((lvl+1)*5)}% Solar power output.` },
  { id:'automatedOps',     kind:'level', name:'Automated Operations', maxLevel:6, baseCost:24, growth:1.55, requires:[], desc:lvl=>`-${Math.round((lvl+1)*5)}% on all staff salaries (currently -${Math.round(lvl*5)}%).` },
  { id:'cyberShield',      kind:'level', name:'AI Cyber Shield',      maxLevel:5, baseCost:18, growth:1.6,  requires:[], desc:lvl=>`+${Math.round((lvl+1)*9)} pts of cyberattack defense (currently +${Math.round(lvl*9)}).` },
  { id:'modularExpansion', kind:'level', name:'Modular Expansion',    maxLevel:7, baseCost:50, growth:1.7,  requires:[], desc:lvl=>`Raises the building level cap to ${3+lvl+1} (currently ${3+lvl}).` },
  { id:'quantumPrototype', kind:'level', name:'Quantum Prototype',    maxLevel:5, baseCost:55, growth:1.6,  requires:['nextGenGPU'], desc:lvl=>`+${(lvl+1)*30} flat PFLOPS of GPU compute (currently +${lvl*30}).` },
  { id:'fusionGrid',       kind:'level', name:'Fusion Grid',          maxLevel:6, baseCost:70, growth:1.6,  requires:['renewableSubsidy'], desc:lvl=>`+${(lvl+1)*25} MW of flat power capacity (currently +${lvl*25}).` },
  { id:'neuralCompression',kind:'level', name:'Neural Compression',   maxLevel:6, baseCost:80, growth:1.6,  requires:['nextGenGPU'], desc:lvl=>`+${Math.round((lvl+1)*4.5)}% additional GPU output, stacks with Next-Gen GPUs (currently +${Math.round(lvl*4.5)}%).` },
  { id:'globalSalesNetwork',kind:'level',name:'Global Sales Network', maxLevel:6, baseCost:60, growth:1.55, requires:['automatedOps'], desc:lvl=>`+${lvl+1} contract slots and better odds of Enterprise-tier contracts (currently +${lvl}).` },
  { id:'hyperscaleAutomation',kind:'level',name:'Hyperscale Automation', maxLevel:6, baseCost:90, growth:1.6, requires:['automatedOps','liquidCooling'], desc:lvl=>`-${Math.round((lvl+1)*3.5)}% upkeep on every building (currently -${Math.round(lvl*3.5)}%).` },
  { id:'orbitalRelay',     kind:'level', name:'Orbital Data Relay',   maxLevel:6, baseCost:130, growth:1.65, requires:['quantumPrototype'], desc:lvl=>`+${(lvl+1)*45} more flat PFLOPS of GPU compute (currently +${lvl*45}).` },

  { id:'nuclearProgram',        kind:'unlock', name:'Nuclear Program',        cost:200, rareCost:10, requires:['renewableSubsidy','fusionGrid'], infraReq:{cyberShield:2, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'nuclear',       desc:()=>'Unlocks the Nuclear Reactor — massive Power output.' },
  { id:'neuromorphicComputing', kind:'unlock', name:'Neuromorphic Computing', cost:220, rareCost:12, requires:['liquidCooling'], infraReq:{cyberShield:2, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'neuromorphic', desc:()=>'Unlocks the Neuromorphic Array — a huge leap in CPU compute.' },
  { id:'quantumAccelerators',   kind:'unlock', name:'Quantum Accelerators',   cost:260, rareCost:15, requires:['neuralCompression','quantumPrototype'], infraReq:{cyberShield:2, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'quantumAccel', desc:()=>'Unlocks the Quantum Accelerator — the ultimate GPU building.' },
  { id:'holographicStorage',    kind:'unlock', name:'Holographic Storage',    cost:180, rareCost:10, requires:['liquidCooling'], infraReq:{cyberShield:2, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'holoArchive', desc:()=>'Unlocks the Holographic Archive — massive storage density.' },
  { id:'cryoCooling',           kind:'unlock', name:'Cryogenic Cooling',      cost:200, rareCost:11, requires:['liquidCooling'], infraReq:{cyberShield:2, liquidCooling:3, coolingBuilt:1, securityBuilt:1}, unlocks:'cryoCooling', desc:()=>'Unlocks the Cryo-Cooling Array — far stronger PUE reduction.' },
  { id:'aiSentinel',            kind:'unlock', name:'AI Sentinel Program',    cost:210, rareCost:12, requires:['cyberShield'], infraReq:{cyberShield:3, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'aiSentinel', desc:()=>'Unlocks the AI Sentinel Grid — top-tier cyber-defense.' },
  { id:'quantumLab',            kind:'unlock', name:'Quantum Research Lab',   cost:240, rareCost:14, requires:['modularExpansion'], infraReq:{cyberShield:2, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'quantumLab', desc:()=>'Unlocks the Quantum Lab — far faster research generation.' },
  { id:'orbitalMining',         kind:'unlock', name:'Orbital Mining Program', cost:260, rareCost:16, requires:[], infraReq:{cyberShield:2, liquidCooling:2, coolingBuilt:1, securityBuilt:1}, unlocks:'orbitalMiner', desc:()=>'Unlocks the Orbital Mining Array — much faster rare alloy income. Requires the Supply Chain facility.' },

  // --- Tier 3: the true late game. Brutally expensive, gated behind a well-rounded
  // operation (high Security/Cooling research, several tier-2 buildings already live)
  // and behind Singularity Cores — a refined resource you have to manufacture, not just mine.
  { id:'fusionCoreProgram',   kind:'unlock', name:'Fusion Core Program',       cost:1200, rareCost:60, coreCost:10, requires:['nuclearProgram'], infraReq:{cyberShield:4, liquidCooling:4, coolingBuilt:2, securityBuilt:2, tier2Built:3}, unlocks:'fusionCore', desc:()=>'Unlocks the Fusion Core — power output on a different scale entirely.' },
  { id:'photonicMeshProgram', kind:'unlock', name:'Photonic Mesh Program',    cost:1300, rareCost:65, coreCost:11, requires:['neuromorphicComputing'], infraReq:{cyberShield:4, liquidCooling:4, coolingBuilt:2, securityBuilt:2, tier2Built:3}, unlocks:'photonicMesh', desc:()=>'Unlocks the Photonic Mesh — light-speed CPU compute.' },
  { id:'singularityArrayProgram', kind:'unlock', name:'Singularity Array Program', cost:1500, rareCost:75, coreCost:14, requires:['quantumAccelerators'], infraReq:{cyberShield:5, liquidCooling:5, coolingBuilt:2, securityBuilt:2, tier2Built:3}, unlocks:'singularityArray', desc:()=>'Unlocks the Singularity Array — the theoretical ceiling of GPU compute.' },
  { id:'dimensionalVaultProgram', kind:'unlock', name:'Dimensional Vault Program', cost:1100, rareCost:55, coreCost:9, requires:['holographicStorage'], infraReq:{cyberShield:4, liquidCooling:4, coolingBuilt:2, securityBuilt:2, tier2Built:3}, unlocks:'dimensionalVault', desc:()=>'Unlocks the Dimensional Vault — storage that shouldn\u2019t be physically possible.' },
  { id:'zeroPointProgram',    kind:'unlock', name:'Zero-Point Cooling Program', cost:1200, rareCost:60, coreCost:10, requires:['cryoCooling'], infraReq:{cyberShield:4, liquidCooling:6, coolingBuilt:3, securityBuilt:2, tier2Built:3}, unlocks:'zeroPointField', desc:()=>'Unlocks the Zero-Point Field — cooling that erases PUE almost entirely.' },
  { id:'quantumShieldProgram',kind:'unlock', name:'Quantum Shield Program',   cost:1200, rareCost:60, coreCost:10, requires:['aiSentinel'], infraReq:{cyberShield:5, liquidCooling:4, coolingBuilt:2, securityBuilt:3, tier2Built:3}, unlocks:'quantumShield', desc:()=>'Unlocks the Quantum Encryption Shield — near-total cyber-defense.' },
  { id:'thinkTankProgram',    kind:'unlock', name:'Singularity Think Tank Program', cost:1400, rareCost:70, coreCost:13, requires:['quantumLab'], infraReq:{cyberShield:4, liquidCooling:4, coolingBuilt:2, securityBuilt:2, tier2Built:3}, unlocks:'singularityThinkTank', desc:()=>'Unlocks the Singularity Think Tank — research output beyond anything else on the tree.' },
  { id:'fabricationProgram',  kind:'unlock', name:'Fabrication Complex Program', cost:900, rareCost:80, requires:['orbitalMining'], infraReq:{cyberShield:3, liquidCooling:3, coolingBuilt:1, securityBuilt:1, tier2Built:2}, unlocks:'fabricationComplex', desc:()=>'Unlocks the Fabrication Complex — refines rare alloys into Singularity Cores, the resource every tier-3 program needs.' },
];

const CLIENTS = ['Vertex Labs','Helios AI','Quantum Foundry','Nimbus Systems','Argus Analytics','Solace Robotics','Marlowe Genomics','Ionic Media','Pinnacle Finance','Echo Studios','Borealis Defense','Cascade Biotech','Astra Dynamics','Fathom Research'];

const ACHIEVEMENTS = [
  { id:'first_building', name:'First Foundations',    cond: s => allSlots(s).some(sl=>sl.building), reward:0 },
  { id:'first_gpu',       name:'Raw Compute Power',    cond: s => allSlots(s).some(sl=>sl.building && sl.building.type==='gpuCluster'), reward:2000 },
  { id:'cash_10k',        name:'Five Figures',         cond: s => s.cash >= 10000, reward:0 },
  { id:'cash_100k',       name:'Six Figures',          cond: s => s.cash >= 100000, reward:0 },
  { id:'cash_1m',         name:'Hyperscaler',          cond: s => s.cash >= 1000000, reward:0 },
  { id:'rep_100',         name:'Perfect Reputation',   cond: s => s.reputation >= 100, reward:5000 },
  { id:'contracts_10',    name:'Solid Portfolio',      cond: s => s.stats.contractsCompleted >= 10, reward:0 },
  { id:'contracts_50',    name:'Trusted Provider',     cond: s => s.stats.contractsCompleted >= 50, reward:15000 },
  { id:'survived_attack', name:'Cyber Resilience',     cond: s => s.stats.attacksSurvived >= 1, reward:0 },
  { id:'tech_5',          name:'Head of R&D',          cond: s => totalTechLevels(s) >= 5, reward:5000 },
  { id:'first_manager',   name:'Hands-Free Sales',     cond: s => s.staff.manager >= 1, reward:0 },
  { id:'supply_unlocked', name:'Supply Lines Open',    cond: s => s.facilities.supply.unlocked, reward:5000 },
  { id:'first_tier2',     name:'Cutting Edge',         cond: s => allSlots(s).some(sl=>sl.building && BUILDING_DEFS[sl.building.type].tier===2), reward:25000 },
  { id:'level5_building', name:'Fully Modernized',     cond: s => allSlots(s).some(sl=>sl.building && sl.building.level>=5), reward:12000 },
  { id:'level10_building',name:'Maxed Out',            cond: s => allSlots(s).some(sl=>sl.building && sl.building.level>=10), reward:40000 },
  { id:'contracts_200',   name:'Industry Backbone',    cond: s => s.stats.contractsCompleted >= 200, reward:75000 },
  { id:'net_worth_5m',    name:'Titan of Compute',     cond: s => s.cash >= 5000000, reward:0 },
  { id:'went_public',     name:'Went Public',          cond: s => (s.prestigeLevel||0) >= 1, reward:0 },
  { id:'first_tier3',     name:'Singularity Achieved', cond: s => !!s.singularityUnlocked, reward:100000 },
  { id:'fabrication_online', name:'Refined Supply Chain', cond: s => allSlots(s).some(sl=>sl.building && sl.building.type==='fabricationComplex'), reward:30000 },
  { id:'tier3_x3',        name:'Beyond the Frontier',  cond: s => builtTier3Count(s) >= 3, reward:200000 },
  { id:'net_worth_25m',   name:'Post-Scarcity',        cond: s => s.cash >= 25000000, reward:0 },
  { id:'all_tech',        name:'Innovation Leader',    cond: s => TECH_TREE.every(t => (s.techLevels[t.id]||0) >= (t.kind==='unlock'?1:t.maxLevel)), reward:400000 },
];

const EXPAND_BASE_COST = 8000;
const EXPAND_GROWTH = 2.2;
const STARTER_SLOTS = 6;
const SUPPLY_UNLOCK_TECH_LEVELS = 3; // sum of tech levels needed before Supply Chain appears
const PRESTIGE_MIN_CASH = 750000;
const PRESTIGE_TITLES = ['Operator','Regional Director','National Hyperscaler','Global Hyperscaler','Interplanetary Hyperscaler'];
const AUTO_ACCEPT_CYCLE = 5; // progress units needed per manager cycle

const SPEED_MS = { 0: null, 1: 2600, 2: 1100, 4: 400 };

const RANDOM_EVENTS = [
  { id:'blackout', weight:3, name:'Regional Power Outage', run: s => {
      const mitig = technicianMitigation(s);
      const severity = 0.35 * (1-mitig);
      s.effects.push({ id:'blackout', daysLeft:2, powerMult: 1-severity });
      log(s, `Regional power outage: energy capacity down ${Math.round(severity*100)}% for 2 days${mitig>0?` (softened by your technicians)`:''}.`, 'bad');
    }},
  { id:'heatwave', weight:3, name:'Heatwave', run: s => {
      const hasCooling = allSlots(s).some(sl=>sl.building && BUILDING_DEFS[sl.building.type].category==='cooling');
      const mitig = technicianMitigation(s);
      const upkeepSeverity = 0.6 * (1-mitig);
      s.effects.push({ id:'heatwave', daysLeft:3, upkeepMult:1+upkeepSeverity, computeMult: hasCooling?0.95:(0.8+0.15*mitig) });
      log(s, `Heatwave: cooling costs spike for 3 days${hasCooling?'':' (no cooling facilities: compute output drops)'}${mitig>0?` (softened by your technicians)`:''}.`, 'warn');
    }},
  { id:'cyberattack', weight:2, name:'Cyberattack', run: s => {
      let defense = Math.min(0.85, cyberDefense(s));
      const baseLoss = Math.round(s.cash * 0.12 + 1500);
      const loss = Math.round(baseLoss * (1-defense));
      s.cash -= loss;
      s.reputation = clamp(s.reputation - (defense>0.5?2:6), 0, 100);
      s.stats.attacksSurvived++;
      log(s, `Cyberattack! Defense ${(defense*100).toFixed(0)}% → lost $${fmt(loss)}.`, 'bad');
    }},
  { id:'viral_demand', weight:3, name:'Viral AI Demand', run: s => {
      s.effects.push({ id:'viral_demand', daysLeft:4, payMult:1.5 });
      log(s, `An AI model goes viral: new contracts pay 50% more for 4 days!`, 'good');
    }},
  { id:'gpu_shortage', weight:2, name:'GPU Shortage', run: s => {
      s.effects.push({ id:'gpu_shortage', daysLeft:5, gpuCostMult:1.35 });
      log(s, `Global GPU shortage: GPU building costs rise 35% for 5 days.`, 'warn');
    }},
  { id:'audit', weight:2, name:'Regulatory Audit', run: s => {
      const fine = Math.round(400 + allSlots(s).filter(sl=>sl.building).length * 250);
      s.cash -= fine;
      log(s, `Regulatory audit: compliance fine of $${fmt(fine)}.`, 'warn');
    }},
  { id:'market_boom', weight:2, name:'AI Market Boom', run: s => {
      const bonus = Math.round(2000 + s.cash * 0.04);
      s.cash += bonus;
      log(s, `AI market boom: your assets rise in value (+$${fmt(bonus)}).`, 'good');
    }},
  { id:'rare_find', weight:1, name:'Salvage Windfall', run: s => {
      if (!s.facilities.supply.unlocked) return;
      const bonus = 3 + Math.floor(Math.random()*5);
      s.rareAlloys += bonus;
      log(s, `Salvage windfall: your supply teams recover +${bonus} rare alloys.`, 'good');
    }},
];

/* ================= STATE ================= */

let state = null;
let loopHandle = null;
let currentSpeed = 1;

function makeSlots(n, startId){
  const arr = [];
  for (let i=0;i<n;i++) arr.push({ id:startId+i, building:null });
  return arr;
}

function freshState(operatorName, prestigeLevel){
  const level = prestigeLevel || 0;
  const facilities = {};
  for (const cat of CATEGORY_ORDER){
    facilities[cat] = { slots: cat==='supply' ? [] : makeSlots(STARTER_SLOTS, 0), unlocked: cat!=='supply' };
  }
  // Starter kit: a free Solar Farm + CPU Rack so new operators start with
  // power and compute already running, at no cost.
  facilities.power.slots[0].building = { type:'solar', level:1, builtDay:1 };
  facilities.cpu.slots[0].building = { type:'cpuRack', level:1, builtDay:1 };

  return {
    operator: operatorName || 'NEXUS',
    day: 1,
    cash: 25000 + level*10000,
    reputation: 50,
    research: 0,
    rareAlloys: 0,
    singularityCores: 0,
    singularityUnlocked: false,
    facilities,
    staff: { technician:0, scientist:0, sales:0, security:0, manager:0 },
    techLevels: {},
    contracts: { available: [ generateStarterContract() ], active: [] },
    autoAcceptProgress: 0,
    // Grace period: first week runs at reduced upkeep/salaries with no random events,
    // so new operators have room to learn without being punished.
    effects: [ { id:'grace', daysLeft:7, upkeepMult:0.35, salaryMult:0.5 } ],
    log: [],
    achievements: [],
    stats: { contractsCompleted:0, contractsFailed:0, attacksSurvived:0, totalEarned:0, autoAccepted:0 },
    gameOver: false,
    prestigeLevel: level,
    tutorialDone: false,
    tipsDismissed: false,
    deficitWarned: false,
    advisorLastDay: 0,
    advisorLastId: null,
  };
}

function generateStarterContract(){
  return {
    id: 'starter',
    client: 'Local Pilot Co.',
    type: 'inference',
    computeType: 'cpu',
    amount: 4,
    storageAmt: 0,
    duration: 5,
    totalDuration: 5,
    dailyPay: 320,
    lump: 400,
    repGain: 2,
    repLoss: 2,
    expiresIn: 6,
  };
}

/* ================= UTILS ================= */

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
function money(n){ return (n<0?'-$':'$') + fmt(Math.abs(n)); }
function signedMoney(n){ return (n>=0?'+$':'-$') + fmt(Math.abs(n)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function weightedPick(items){
  const total = items.reduce((a,b)=>a+b.weight,0);
  let r = Math.random()*total;
  for (const it of items){ if ((r-=it.weight) <= 0) return it; }
  return items[items.length-1];
}
function effectVal(state, key, base){
  let v = base;
  for (const e of state.effects){
    if (e[key] !== undefined) v *= e[key];
  }
  return v;
}
function log(s, text, kind){
  s.log.unshift({ day:s.day, text, kind:kind||'' });
  if (s.log.length > 200) s.log.length = 200;
}

/* ================= HELPERS ================= */

function allSlots(s){
  const out = [];
  for (const cat of CATEGORY_ORDER) out.push(...s.facilities[cat].slots);
  return out;
}
function levelMult(level){ return 1 + (level-1)*0.8; }
function techLevel(s, id){ return s.techLevels[id] || 0; }
function totalTechLevels(s){ return Object.values(s.techLevels).reduce((a,b)=>a+b,0); }
function maxBuildingLevel(s){ return 3 + techLevel(s,'modularExpansion'); }

function buildingsForCategory(catId){
  return Object.keys(BUILDING_DEFS).filter(k => BUILDING_DEFS[k].category===catId)
    .map(k => ({ key:k, def:BUILDING_DEFS[k] }));
}

function isBuildingUnlocked(s, key){
  const def = BUILDING_DEFS[key];
  if (!def.requiresTech) return true;
  return techLevel(s, def.requiresTech) >= 1;
}

function cyberDefense(s){
  let defensePower = 0;
  for (const sl of allSlots(s)){
    if (sl.building && BUILDING_DEFS[sl.building.type].defensePower){
      defensePower += BUILDING_DEFS[sl.building.type].defensePower * levelMult(sl.building.level);
    }
  }
  let defense = Math.min(0.7, defensePower*0.05 + s.staff.security*0.06);
  defense += techLevel(s,'cyberShield') * 0.009;
  return Math.min(0.95, defense);
}

/* ================= DERIVED STATS ================= */

function computeDerived(s){
  let powerCap=0, powerUse=0, computeCapCpu=0, computeCapGpu=0, storageCap=0, coolingPower=0;

  for (const sl of allSlots(s)){
    if (!sl.building) continue;
    const def = BUILDING_DEFS[sl.building.type];
    const mult = levelMult(sl.building.level);

    if (def.power){
      let pw = def.power*mult;
      if (sl.building.type==='solar') pw *= (1 + techLevel(s,'renewableSubsidy')*0.05);
      powerCap += pw;
    }
    if (def.powerUse) powerUse += def.powerUse*mult;
    if (def.compute){
      let c = def.compute*mult;
      if (def.category==='gpu'){
        c *= (1 + techLevel(s,'nextGenGPU')*0.09);
        c *= (1 + techLevel(s,'neuralCompression')*0.045);
        computeCapGpu += c;
      } else {
        computeCapCpu += c;
      }
    }
    if (def.storage) storageCap += def.storage*mult;
    if (def.coolingPower) coolingPower += def.coolingPower*mult;
  }

  powerUse *= Math.max(0.72, 1 - techLevel(s,'liquidCooling')*0.035);
  computeCapGpu += techLevel(s,'quantumPrototype')*30;
  computeCapGpu += techLevel(s,'orbitalRelay')*45;
  powerCap += techLevel(s,'fusionGrid')*25;

  const blackoutMult = effectVal(s, 'powerMult', 1);
  powerCap = powerCap * blackoutMult;

  const computeMult = effectVal(s, 'computeMult', 1);
  const scientistBonus = 1 + Math.min(0.5, s.staff.scientist*0.05);
  computeCapCpu = computeCapCpu * computeMult * scientistBonus;
  computeCapGpu = computeCapGpu * computeMult * scientistBonus;

  // compute used by active contracts
  let computeUsedGpu=0, computeUsedCpu=0, storageUsed=0;
  for (const c of s.contracts.active){
    if (c.type==='storage'){ storageUsed += c.amount; continue; }
    if (c.computeType==='gpu') computeUsedGpu += c.amount;
    else computeUsedCpu += c.amount;
  }

  const pue = powerUse>0 ? (1 + Math.max(0, (0.9 - coolingPower*0.1))) : 1;

  return {
    powerCap, powerUse,
    computeCapCpu, computeCapGpu,
    computeCap: computeCapCpu+computeCapGpu,
    computeUsedGpu, computeUsedCpu, computeUsed: computeUsedGpu+computeUsedCpu,
    storageCap, storageUsed,
    coolingPower,
    pue,
    powerOk: powerUse <= powerCap,
  };
}

/* ================= BUILD / SLOTS ================= */

function nextExpandCost(s, catId){
  const owned = s.facilities[catId].slots.length;
  const batches = Math.max(1, Math.round(owned/4));
  return Math.round(EXPAND_BASE_COST * Math.pow(EXPAND_GROWTH, batches-1));
}

function buildingCost(s, key){
  const def = BUILDING_DEFS[key];
  let cost = def.cost;
  if (key==='solar') cost *= Math.max(0.5, 1 - techLevel(s,'renewableSubsidy')*0.06);
  if (def.category==='gpu'){
    const shortage = s.effects.find(e=>e.id==='gpu_shortage');
    if (shortage) cost *= shortage.gpuCostMult;
  }
  return Math.round(cost);
}

function buildOnSlot(catId, slotId, key){
  const s = state;
  const slot = s.facilities[catId].slots.find(sl=>sl.id===slotId);
  if (!slot || slot.building) return;
  const def = BUILDING_DEFS[key];
  if (def.tier>=2 && !isBuildingUnlocked(s, key)) { toast('This building is still locked — research its unlock tech first.', 'bad'); return; }
  const cost = buildingCost(s, key);
  const rareCost = def.rareCost||0;
  const coreCost = def.coreCost||0;
  if (s.cash < cost) { toast('Not enough cash for this build.', 'bad'); return; }
  if (rareCost && s.rareAlloys < rareCost) { toast(`Not enough rare alloys (need ${rareCost}).`, 'bad'); return; }
  if (coreCost && s.singularityCores < coreCost) { toast(`Not enough singularity cores (need ${coreCost}).`, 'bad'); return; }
  s.cash -= cost;
  if (rareCost) s.rareAlloys -= rareCost;
  if (coreCost) s.singularityCores -= coreCost;
  slot.building = { type:key, level:1, builtDay:s.day };
  log(s, `Built: ${def.name} (${CATEGORIES[catId].name}) for ${money(cost)}${rareCost?` + ${rareCost} rare alloys`:''}${coreCost?` + ${coreCost} singularity cores`:''}.`, '');
  if (def.tier===3) markSingularityReached(s);
  renderAll();
}

/* First tier-3 building ever built triggers a one-time celebration: a visual theme
   change, a special modal, and it unlocks Singularity-tier contracts — the payoff for
   reaching the true late game. */
function markSingularityReached(s){
  if (s.singularityUnlocked) return;
  s.singularityUnlocked = true;
  document.body.classList.add('singularity-theme');
  log(s, `🌌 The Singularity has been reached. Reality itself starts bending to your compute.`, 'achv');
  showSingularityModal();
}

function showSingularityModal(){
  closeModal();
  const box = document.getElementById('modal-box');
  box.className = 'modal-box singularity-modal';
  box.innerHTML = `
    <h3>🌌 Singularity Achieved</h3>
    <p class="modal-sub">Your first tier-3 facility just came online. Something has changed.</p>
    <p style="font-size:12.5px;line-height:1.7;color:var(--text-dim);margin:0 0 14px;">
      Word of what you've built spreads fast. A new class of client — the kind that used to be rumors — starts showing up in your contract feed, offering deals no ordinary data center could fulfill. Your dashboard has taken on a different glow, too; you'll notice it.
    </p>
    <div class="modal-row"><span>New contract tier unlocked</span><b style="color:var(--violet);">Singularity</b></div>
    <div class="modal-row"><span>Visual theme unlocked</span><b style="color:var(--violet);">Singularity Mode</b></div>
    <div class="modal-actions"><button class="btn btn-primary btn-block" id="modal-close">Continue</button></div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function upgradeSlot(catId, slotId){
  const s = state;
  const slot = s.facilities[catId].slots.find(sl=>sl.id===slotId);
  if (!slot || !slot.building || slot.building.level>=maxBuildingLevel(s)) return;
  const def = BUILDING_DEFS[slot.building.type];
  const cost = Math.round(def.cost * 0.65 * slot.building.level);
  if (s.cash < cost) { toast('Not enough cash for this upgrade.', 'bad'); return; }
  s.cash -= cost;
  slot.building.level++;
  log(s, `Upgraded: ${def.name} (${CATEGORIES[catId].name}) → level ${slot.building.level}.`, '');
  renderCategoryModal(catId);
  renderAll();
}

function demolishSlot(catId, slotId){
  const s = state;
  const slot = s.facilities[catId].slots.find(sl=>sl.id===slotId);
  if (!slot || !slot.building) return;
  const def = BUILDING_DEFS[slot.building.type];
  const refund = Math.round(def.cost * 0.3 * slot.building.level);
  s.cash += refund;
  log(s, `Demolished: ${def.name} (${CATEGORIES[catId].name}), refunded ${money(refund)}.`, '');
  slot.building = null;
  renderCategoryModal(catId);
  renderAll();
}

function expandCategory(catId){
  const s = state;
  const cost = nextExpandCost(s, catId);
  if (s.cash < cost) { toast('Not enough cash to expand this facility.', 'bad'); return; }
  s.cash -= cost;
  const fac = s.facilities[catId];
  const start = fac.slots.length;
  for (let i=0;i<4;i++) fac.slots.push({ id:start+i, building:null });
  log(s, `${CATEGORIES[catId].name} expanded to ${fac.slots.length} slots for ${money(cost)}.`, 'good');
  renderCategoryModal(catId);
  renderAll();
}

function maybeUnlockSupply(s){
  if (s.facilities.supply.unlocked) return;
  if (totalTechLevels(s) >= SUPPLY_UNLOCK_TECH_LEVELS){
    s.facilities.supply.unlocked = true;
    s.facilities.supply.slots = makeSlots(4, 0);
    log(s, `New facility unlocked: Supply Chain. Build a Salvage Yard to start recovering rare alloys.`, 'achv');
    toast('📦 New facility unlocked: Supply Chain!', 'achv');
  }
}

/* ================= STAFF ================= */

function hireStaff(type){
  const s = state;
  const def = STAFF_TYPES[type];
  const cost = staffHireCost(type);
  if (s.cash < cost) { toast('Not enough cash to hire.', 'bad'); return; }
  s.cash -= cost;
  s.staff[type]++;
  log(s, `Hired: ${def.name} #${s.staff[type]} for ${money(cost)}.`, '');
  renderAll();
}
function fireStaff(type){
  const s = state;
  if (s.staff[type] <= 0) return;
  s.staff[type]--;
  log(s, `Let go: ${STAFF_TYPES[type].name} (total ${s.staff[type]}).`, '');
  renderAll();
}
function techUpkeepMult(s){ return Math.max(0.55, 1 - techLevel(s,'hyperscaleAutomation')*0.035); }
function dailySalaries(s){
  let total=0;
  for (const t in s.staff) total += s.staff[t]*STAFF_TYPES[t].salary;
  total *= Math.max(0.5, 1 - techLevel(s,'automatedOps')*0.05);
  total *= effectVal(s, 'salaryMult', 1);
  return total;
}

/* Steady-state daily cash flow: contract income minus upkeep minus salaries.
   Ignores one-off lump sums and random events — it's a "if nothing changes" gauge. */
function netCashFlow(s){
  const upkeepMult = effectVal(s, 'upkeepMult', 1) * techUpkeepMult(s);
  let upkeep = 0;
  for (const sl of allSlots(s)){
    if (!sl.building) continue;
    const def = BUILDING_DEFS[sl.building.type];
    upkeep += def.upkeep * sl.building.level * upkeepMult;
  }
  const salaries = dailySalaries(s);
  const contractIncome = s.contracts.active.reduce((sum,c)=>sum+c.dailyPay, 0);
  return contractIncome - upkeep - salaries;
}

/* ================= CONTRACTS ================= */

function contractSlots(s){
  let slots = 3 + Math.floor(s.staff.sales/2) + Math.floor(s.reputation/20) + techLevel(s,'globalSalesNetwork');
  return Math.min(24, slots);
}

function generateContract(s){
  const roll = Math.random();
  let type = roll<0.4 ? 'training' : (roll<0.8 ? 'inference' : 'storage');
  const qualityBoost = (1 + s.staff.sales*0.03 + (s.reputation-50)*0.0045) * (1 + (s.prestigeLevel||0)*0.15);
  const client = pick(CLIENTS);

  // Enterprise-tier contracts unlock once reputation is high enough; Singularity-tier
  // contracts unlock once your first tier-3 facility is online — both scale up to put
  // an increasingly capable campus to good use.
  let enterpriseChance = s.reputation>=70 ? 0.22 : 0;
  enterpriseChance += techLevel(s,'globalSalesNetwork')*0.02;
  const singularityChance = s.singularityUnlocked ? 0.07 : 0;
  const tierRoll = Math.random();
  const singularity = singularityChance>0 && tierRoll < singularityChance;
  const enterprise = !singularity && enterpriseChance>0 && tierRoll < singularityChance+enterpriseChance;
  const scale = singularity ? (7 + Math.random()*5) : enterprise ? (2 + Math.random()*2) : 1;

  let amount, duration, dailyPay, lump, repGain, computeType, storageAmt=0;
  if (type==='training'){
    amount = Math.round((8 + Math.random()*22) * qualityBoost * scale);
    duration = 3 + Math.floor(Math.random()*5) + (enterprise?Math.floor(Math.random()*4):0);
    lump = Math.round(amount * duration * (118 + Math.random()*58) * qualityBoost);
    dailyPay = 0;
    repGain = Math.round((2 + amount/8) * (1+(s.prestigeLevel||0)*0.1));
    computeType = 'gpu';
  } else if (type==='inference'){
    amount = Math.round((4 + Math.random()*10) * qualityBoost * scale);
    duration = 6 + Math.floor(Math.random()*10);
    dailyPay = Math.round(amount * (47 + Math.random()*25) * qualityBoost);
    lump = Math.round(dailyPay * 2);
    repGain = Math.round((1 + amount/10) * (1+(s.prestigeLevel||0)*0.1));
    computeType = Math.random()<0.5 ? 'gpu' : 'cpu';
  } else {
    amount = Math.round((20 + Math.random()*40) * qualityBoost * scale);
    duration = 8 + Math.floor(Math.random()*10);
    dailyPay = Math.round(amount * (3.4 + Math.random()*2.6) * qualityBoost);
    lump = Math.round(dailyPay * 2);
    repGain = 1;
    computeType = 'storage';
    storageAmt = amount;
  }
  return {
    id: 'c'+Math.random().toString(36).slice(2,9),
    client, type, computeType, amount, storageAmt, enterprise, singularity,
    duration, totalDuration:duration, dailyPay, lump,
    repGain, repLoss: Math.round(repGain*1.5)+2,
    expiresIn: 3 + Math.floor(Math.random()*3),
  };
}

function refreshContractPool(s){
  const slots = contractSlots(s);
  while (s.contracts.available.length < slots){
    s.contracts.available.push(generateContract(s));
  }
}

function contractFits(s, c, derived){
  const freeGpu = derived.computeCapGpu - derived.computeUsedGpu;
  const freeCpu = derived.computeCapCpu - derived.computeUsedCpu;
  const freeStorage = derived.storageCap - derived.storageUsed;
  if (c.type==='storage') return c.storageAmt <= freeStorage;
  if (c.computeType==='gpu') return c.amount <= freeGpu;
  return c.amount <= freeCpu;
}

function acceptContract(id){
  const s = state;
  const idx = s.contracts.available.findIndex(c=>c.id===id);
  if (idx<0) return;
  const c = s.contracts.available[idx];
  const derived = computeDerived(s);
  if (!contractFits(s, c, derived)){
    const label = c.type==='storage' ? 'storage' : c.computeType==='gpu' ? 'GPU' : 'CPU';
    toast(`Not enough ${label} capacity for this contract.`, 'bad');
    return;
  }
  const viral = s.effects.find(e=>e.id==='viral_demand');
  if (viral){ c.dailyPay = Math.round(c.dailyPay*viral.payMult); c.lump = Math.round(c.lump*viral.payMult); }

  s.contracts.available.splice(idx,1);
  s.contracts.active.push(c);
  log(s, `Contract accepted: ${c.client} (${contractLabel(c.type)}).`, '');
  renderAll();
}

function declineContract(id){
  const s = state;
  s.contracts.available = s.contracts.available.filter(c=>c.id!==id);
  renderAll();
}

function contractLabel(type){
  return type==='training' ? 'AI Training' : type==='inference' ? 'Live Inference' : 'Data Storage';
}

/* Account Managers automatically accept the best-fitting available contract every few
   days — faster with more managers hired. This is what takes contract babysitting out
   of the mid/late game. */
function autoAcceptContracts(s){
  if (s.staff.manager <= 0) return;
  s.autoAcceptProgress += s.staff.manager;
  while (s.autoAcceptProgress >= AUTO_ACCEPT_CYCLE){
    const derived = computeDerived(s);
    const candidates = s.contracts.available
      .filter(c => contractFits(s, c, derived))
      .sort((a,b) => (b.enterprise?1:0)-(a.enterprise?1:0) || (b.lump+b.dailyPay*b.totalDuration) - (a.lump+a.dailyPay*a.totalDuration));
    if (candidates.length === 0){
      s.autoAcceptProgress = AUTO_ACCEPT_CYCLE; // keep it topped up, retry as soon as capacity/pool changes
      break;
    }
    const c = candidates[0];
    const idx = s.contracts.available.findIndex(x=>x.id===c.id);
    s.contracts.available.splice(idx,1);
    s.contracts.active.push(c);
    s.stats.autoAccepted++;
    log(s, `🤖 Auto-accepted: ${c.client} (${contractLabel(c.type)}).`, '');
    s.autoAcceptProgress -= AUTO_ACCEPT_CYCLE;
  }
}

/* ================= RESEARCH ================= */

function techCost(tech, currentLevel){
  if (tech.kind==='unlock') return { research: tech.cost, rare: tech.rareCost||0, core: tech.coreCost||0 };
  const cost = Math.round(tech.baseCost * Math.pow(tech.growth, currentLevel));
  return { research: cost, rare: 0, core: 0 };
}

function builtCountInCategory(s, catId){
  return s.facilities[catId].slots.filter(sl=>sl.building).length;
}
function builtTier2Count(s){
  return allSlots(s).filter(sl=>sl.building && BUILDING_DEFS[sl.building.type].tier===2).length;
}
function builtTier3Count(s){
  return allSlots(s).filter(sl=>sl.building && BUILDING_DEFS[sl.building.type].tier===3).length;
}

/* Checks the shared "well-rounded operation" gate used by tier-2 and tier-3 unlocks:
   you can't rush a single category — Security and Cooling research + actual built
   facilities are required across the board before advanced hardware unlocks. */
function meetsInfraReq(s, req){
  if (!req) return true;
  if (req.cyberShield && techLevel(s,'cyberShield') < req.cyberShield) return false;
  if (req.liquidCooling && techLevel(s,'liquidCooling') < req.liquidCooling) return false;
  if (req.coolingBuilt && builtCountInCategory(s,'cooling') < req.coolingBuilt) return false;
  if (req.securityBuilt && builtCountInCategory(s,'security') < req.securityBuilt) return false;
  if (req.tier2Built && builtTier2Count(s) < req.tier2Built) return false;
  return true;
}

function infraReqLabel(req){
  if (!req) return '';
  const parts = [];
  if (req.cyberShield) parts.push(`AI Cyber Shield Lv.${req.cyberShield}`);
  if (req.liquidCooling) parts.push(`Liquid Cooling Lv.${req.liquidCooling}`);
  if (req.coolingBuilt) parts.push(`${req.coolingBuilt}+ Cooling building(s) built`);
  if (req.securityBuilt) parts.push(`${req.securityBuilt}+ Security building(s) built`);
  if (req.tier2Built) parts.push(`${req.tier2Built}+ Advanced (tier-2) buildings built`);
  return parts.join(', ');
}

function canResearch(s, techId){
  const tech = TECH_TREE.find(t=>t.id===techId);
  if (!tech) return false;
  const lvl = techLevel(s, techId);
  const maxLvl = tech.kind==='unlock' ? 1 : tech.maxLevel;
  if (lvl >= maxLvl) return false;
  if (!tech.requires.every(r => techLevel(s, r) >= 1)) return false;
  if (tech.kind==='unlock' && !meetsInfraReq(s, tech.infraReq)) return false;
  return true;
}

function researchTech(techId){
  const s = state;
  const tech = TECH_TREE.find(t=>t.id===techId);
  if (!tech || !canResearch(s, techId)) return;
  const lvl = techLevel(s, techId);
  const cost = techCost(tech, lvl);
  if (s.research < cost.research){ toast('Not enough research points.', 'bad'); return; }
  if (cost.rare && s.rareAlloys < cost.rare){ toast(`Not enough rare alloys (need ${cost.rare}).`, 'bad'); return; }
  if (cost.core && s.singularityCores < cost.core){ toast(`Not enough singularity cores (need ${cost.core}).`, 'bad'); return; }
  s.research -= cost.research;
  if (cost.rare) s.rareAlloys -= cost.rare;
  if (cost.core) s.singularityCores -= cost.core;
  s.techLevels[techId] = lvl+1;
  const newLevel = s.techLevels[techId];
  if (tech.kind==='unlock'){
    log(s, `Breakthrough: ${tech.name} — ${BUILDING_DEFS[tech.unlocks].name} unlocked!`, 'good');
    toast(`🔓 ${BUILDING_DEFS[tech.unlocks].name} unlocked!`, 'achv');
  } else {
    log(s, `Research: ${tech.name} → level ${newLevel}.`, 'good');
  }
  maybeUnlockSupply(s);
  renderAll();
}

/* ================= TUTORIAL ================= */

const TUTORIAL_STEPS = [
  { target:null, title:'Welcome to HYPERSCALE', text:'You run a data center empire that sells <b>compute power</b> to AI companies. To keep things calm while you learn, you start with a <b>free Solar Farm + CPU Rack</b> already running, plus a <b>7-day grace period</b> with reduced costs and no random events.' },
  { target:'.ticker-stats', title:'Your dashboard', text:'These are your vitals: <b>Cash</b> (with a +/- $/day flow indicator), <b>Power</b>, <b>CPU</b> and <b>GPU</b> compute (tracked separately), <b>Reputation</b>, and <b>R&D</b> points. If the cash flow turns red, your costs are outpacing your income.' },
  { target:'#category-grid', title:'Your facilities', text:'Each tile is a <b>facility</b> — Power, CPU, GPU, Storage, Cooling, Security, R&D. Click one to open it and build or upgrade equipment inside. Power and CPU already have a free building running.' },
  { target:'[data-tab="contracts"]', title:'Accept your first contract', text:'Open the <b>Contracts</b> tab now — a small starter contract from <b>Local Pilot Co.</b> is waiting. It only needs 4 PF of CPU compute, which you already have. Accept it to start earning cash right away.' },
  { target:'[data-tab="staff"]', title:'Hire a team', text:'The <b>Staff</b> tab lets you hire Technicians, Data Scientists, Sales Reps, Security Guards — and later, <b>Account Managers</b>, who automatically accept fitting contracts for you so you don\u2019t have to babysit the Contracts tab forever.' },
  { target:'[data-tab="research"]', title:'Research & upgrades', text:'The <b>R&D</b> tab holds a deep tech tree. Most upgrades can be researched <b>again and again</b> for a bigger bonus each time — there\u2019s always another level to buy. A few rare unlocks even require <b>rare alloys</b>, sourced from a Supply Chain facility you\u2019ll unlock later. Once unlocked, you can directly convert an existing building into its advanced version — no need to demolish it first.' },
  { target:'.speed-controls', title:'Time controls', text:'Days pass automatically. Use ⏸ to pause and think, or speed up to 2×/4× once you\u2019re comfortable. Your progress auto-saves after every day.' },
  { target:null, title:'You\u2019re ready to launch', text:'Quick recap: <b>1)</b> accept your starter contract, <b>2)</b> build out Power/CPU/GPU facilities, <b>3)</b> hire an Account Manager once you\u2019re comfortable, <b>4)</b> keep leveling up research. There\u2019s no ceiling — advanced buildings, rare materials and prestige runs await. Good luck, operator!' },
];

let tutorialIndex = 0;
let tutorialActive = false;

function tutorialRectFor(target){
  if (!target){
    return { top: window.innerHeight/2, left: window.innerWidth/2, width:0, height:0 };
  }
  const el = document.querySelector(target);
  if (!el) return tutorialRectFor(null);
  const r = el.getBoundingClientRect();
  const pad = 8;
  return { top:r.top-pad, left:r.left-pad, width:r.width+pad*2, height:r.height+pad*2 };
}

function positionTutorial(){
  const step = TUTORIAL_STEPS[tutorialIndex];
  const rect = tutorialRectFor(step.target);
  const hl = document.getElementById('tutorial-highlight');
  const card = document.getElementById('tutorial-card');

  if (!step.target){
    hl.style.opacity = '0';
    hl.style.top = rect.top+'px'; hl.style.left = rect.left+'px';
    hl.style.width = '0px'; hl.style.height = '0px';
    card.classList.add('centered');
    card.style.top = ''; card.style.left = '';
    return;
  }

  hl.style.opacity = '1';
  hl.style.top = rect.top+'px';
  hl.style.left = rect.left+'px';
  hl.style.width = rect.width+'px';
  hl.style.height = rect.height+'px';
  card.classList.remove('centered');

  requestAnimationFrame(()=>{
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const margin = 16;
    const spaceBelow = window.innerHeight - (rect.top+rect.height);
    const spaceAbove = rect.top;
    let top = (spaceBelow > ch+margin || spaceBelow > spaceAbove)
      ? rect.top+rect.height+margin
      : rect.top-ch-margin;
    let left = rect.left + rect.width/2 - cw/2;
    left = Math.max(12, Math.min(window.innerWidth-cw-12, left));
    top = Math.max(12, Math.min(window.innerHeight-ch-12, top));
    card.style.top = top+'px';
    card.style.left = left+'px';
  });
}

function renderTutorialStep(){
  const step = TUTORIAL_STEPS[tutorialIndex];
  document.getElementById('tutorial-step-label').textContent = `Step ${tutorialIndex+1} of ${TUTORIAL_STEPS.length}`;
  document.getElementById('tutorial-title').textContent = step.title;
  document.getElementById('tutorial-text').innerHTML = step.text;
  document.getElementById('tutorial-back').style.visibility = tutorialIndex===0 ? 'hidden' : 'visible';
  document.getElementById('tutorial-next').textContent = tutorialIndex===TUTORIAL_STEPS.length-1 ? 'Let\'s build!' : 'Next';
  positionTutorial();
}

function startTutorial(){
  closeModal();
  tutorialIndex = 0;
  tutorialActive = true;
  document.getElementById('tutorial-overlay').classList.remove('hidden');
  renderTutorialStep();
  window.addEventListener('resize', positionTutorial);
  window.addEventListener('scroll', positionTutorial, true);
}

function endTutorial(){
  tutorialActive = false;
  document.getElementById('tutorial-overlay').classList.add('hidden');
  window.removeEventListener('resize', positionTutorial);
  window.removeEventListener('scroll', positionTutorial, true);
  if (state){ state.tutorialDone = true; autoSave(); }
}

function nextTutorialStep(){
  if (tutorialIndex >= TUTORIAL_STEPS.length-1){ endTutorial(); return; }
  tutorialIndex++;
  renderTutorialStep();
}
function prevTutorialStep(){
  if (tutorialIndex <= 0) return;
  tutorialIndex--;
  renderTutorialStep();
}

/* ================= ADVISOR (contextual tips) ================= */

function checkAdvisor(s){
  const lastDay = s.advisorLastDay || 0;
  const sinceLast = s.day - lastDay;
  if (sinceLast < 5) return; // don't nag more than once every 5 in-game days

  const net = netCashFlow(s);
  const grace = s.effects.some(e=>e.id==='grace');
  let id = null, msg = null;

  if (s.contracts.active.length===0 && s.contracts.available.length>0){
    id = 'no_contracts';
    msg = 'You have no contracts running. Open Contracts and accept one that fits your compute capacity to start earning cash.';
  } else if (!grace && net < 0){
    id = 'negative_flow';
    msg = `Your daily costs are higher than your income (${signedMoney(net)}/day). Accept another contract, or let go of staff you don\u2019t need yet.`;
  } else if (s.reputation < 30){
    id = 'low_rep';
    msg = 'Your reputation is low, which shrinks contract quality and pay. Complete a few contracts to rebuild it.';
  } else if (s.staff.manager===0 && s.stats.contractsCompleted>=5){
    id = 'no_manager';
    msg = 'Tired of clicking Accept? Hire an Account Manager in the Staff tab — they take over contract-picking automatically.';
  } else if (s.cash > 15000 && allSlots(s).some(sl=>!sl.building)){
    id = 'idle_cash';
    msg = 'You have cash to spare and empty facility slots — open a facility and build something to grow your capacity.';
  } else if (s.staff.sales===0 && s.contracts.available.length<=1 && s.day>10){
    id = 'no_sales';
    msg = 'Hiring a Sales Rep brings in more contract offers, and better ones.';
  } else if (s.research>=15 && totalTechLevels(s)===0){
    id = 'first_tech';
    msg = 'You have enough research points for your first upgrade — check the R&D tab.';
  } else if (s.facilities.supply.unlocked && !allSlots(s).some(sl=>sl.building && sl.building.type==='salvageYard') && s.cash>25000){
    id = 'build_salvage';
    msg = 'Your Supply Chain facility is unlocked but empty — build a Salvage Yard there to start earning rare alloys for advanced hardware.';
  } else if (s.cash >= PRESTIGE_MIN_CASH){
    id = 'prestige_ready';
    msg = `You\u2019ve got ${money(s.cash)} — you qualify to go public. Check the menu (⋮) for a permanent income boost on your next run.`;
  }

  if (!msg) return;
  // wait longer before repeating the exact same tip
  if (id === s.advisorLastId && sinceLast < 10) return;

  toast('💡 ' + msg, 'tip');
  log(s, `Advisor: ${msg}`, 'tip');
  s.advisorLastDay = s.day;
  s.advisorLastId = id;
}

/* ================= GAME LOOP ================= */

function advanceDay(){
  const s = state;
  if (s.gameOver) return;

  // 1. upkeep + salaries
  let upkeep=0;
  const upkeepMult = effectVal(s, 'upkeepMult', 1) * techUpkeepMult(s);
  for (const sl of allSlots(s)){
    if (!sl.building) continue;
    const def = BUILDING_DEFS[sl.building.type];
    upkeep += def.upkeep * sl.building.level * upkeepMult;
    if (def.repPerDay) s.reputation = clamp(s.reputation + def.repPerDay*sl.building.level, 0, 100);
  }
  const salaries = dailySalaries(s);
  s.cash -= (upkeep + salaries);

  // 2. contracts income + progress
  let income=0;
  const stillActive=[];
  for (const c of s.contracts.active){
    income += c.dailyPay;
    c.duration--;
    if (c.duration<=0){
      income += c.lump;
      s.reputation = clamp(s.reputation + c.repGain, 0, 100);
      s.stats.contractsCompleted++;
      s.stats.totalEarned += c.lump + c.dailyPay*c.totalDuration;
      log(s, `Contract completed: ${c.client} — +${money(c.lump)}, +${c.repGain} reputation.`, 'good');
    } else {
      stillActive.push(c);
    }
  }
  s.contracts.active = stillActive;
  s.cash += income;

  // 3. expire available contracts / refresh pool / auto-accept
  // Only ding reputation if the contract could actually have been fulfilled with
  // current capacity — missing infrastructure you haven't built yet isn't negligence.
  const derivedForExpiry = computeDerived(s);
  s.contracts.available = s.contracts.available.filter(c=>{
    c.expiresIn--;
    if (c.expiresIn<=0){
      if (contractFits(s, c, derivedForExpiry)){
        s.reputation = clamp(s.reputation - 1, 0, 100);
      }
      return false;
    }
    return true;
  });
  refreshContractPool(s);
  autoAcceptContracts(s);

  // 4. research + rare alloy + singularity core generation
  let researchGain=0, rareGain=0, coreDemand=0, coreOutBase=0;
  for (const sl of allSlots(s)){
    if (!sl.building) continue;
    const def = BUILDING_DEFS[sl.building.type];
    if (def.researchPerDay) researchGain += def.researchPerDay * levelMult(sl.building.level);
    if (def.rarePerDay) rareGain += def.rarePerDay * levelMult(sl.building.level);
    if (def.coreOutPerDay){
      coreDemand += def.alloyConsumePerDay * levelMult(sl.building.level);
      coreOutBase += def.coreOutPerDay * levelMult(sl.building.level);
    }
  }
  researchGain += s.staff.scientist*0.5;
  s.research += researchGain;
  s.rareAlloys += rareGain;
  // Fabrication Complexes refine rare alloys into singularity cores — throttled by
  // however many alloys are actually in stock that day.
  if (coreDemand > 0){
    const actualAlloysUsed = Math.min(coreDemand, s.rareAlloys);
    const ratio = actualAlloysUsed / coreDemand;
    s.rareAlloys -= actualAlloysUsed;
    s.singularityCores += coreOutBase * ratio;
  }

  // 5. tick down temporary effects
  const wasInGrace = s.effects.some(e=>e.id==='grace');
  s.effects = s.effects.filter(e=>{ e.daysLeft--; return e.daysLeft>0; });
  const stillInGrace = s.effects.some(e=>e.id==='grace');
  if (wasInGrace && !stillInGrace){
    log(s, `Grace period over: upkeep, salaries and random events are back to normal.`, 'warn');
    toast('Grace period ended — full costs and events are now active.', 'warn');
  }

  // 6. random event (skipped during the early grace period to keep things calm)
  if (!stillInGrace && Math.random() < 0.22){
    const ev = weightedPick(RANDOM_EVENTS);
    ev.run(s);
  }

  // 7. power overload check
  const derived = computeDerived(s);
  if (!derived.powerOk){
    s.reputation = clamp(s.reputation - 1, 0, 100);
    log(s, `Power overload: demand exceeds available capacity (${fmt(derived.powerUse)}/${fmt(derived.powerCap)} MW).`, 'warn');
  }

  // 8. supply chain unlock check
  maybeUnlockSupply(s);

  // 9. achievements
  for (const a of ACHIEVEMENTS){
    if (!s.achievements.includes(a.id) && a.cond(s)){
      s.achievements.push(a.id);
      if (a.reward) s.cash += a.reward;
      log(s, `Achievement unlocked: ${a.name}${a.reward?` (+${money(a.reward)})`:''}`, 'achv');
      toast(`🏆 Achievement: ${a.name}`, 'achv');
    }
  }

  // 10. deficit warning (once per dip below zero)
  if (s.cash < 0 && !s.deficitWarned){
    s.deficitWarned = true;
    toast('⚠ You\u2019re running a deficit — accept a contract or dial back spending.', 'warn');
    log(s, `Cash went negative for the first time. Accept a contract or cut back on upkeep.`, 'warn');
  } else if (s.cash >= 0){
    s.deficitWarned = false;
  }

  // 11. bankruptcy check
  if (s.cash < -12000){
    s.gameOver = true;
    log(s, `Bankruptcy. Operations shut down on day ${s.day}.`, 'bad');
    showGameOver();
  }

  // 12. advisor tip
  checkAdvisor(s);

  s.day++;
  renderAll();
}

function setSpeed(sp){
  currentSpeed = sp;
  document.querySelectorAll('.speed-btn').forEach(b=>b.classList.toggle('active', Number(b.dataset.speed)===sp));
  if (loopHandle) clearInterval(loopHandle);
  const ms = SPEED_MS[sp];
  if (ms) loopHandle = setInterval(advanceDay, ms);
}

/* ================= RENDERING ================= */

function renderAll(){
  if (!state) return;
  renderHud();
  renderCategoryCards();
  renderStaffPanel();
  renderContractsPanel();
  renderResearchPanel();
  renderLogPanel();
  renderTipBanner();
  autoSave(); // every state-changing action routes through here, so this is the single save point
}

function renderTipBanner(){
  const banner = document.getElementById('tip-banner');
  banner.classList.toggle('hidden', !!state.tipsDismissed);
}

function renderHud(){
  const s = state;
  const d = computeDerived(s);
  document.getElementById('hud-operator').textContent = s.operator;
  document.getElementById('hud-title').textContent = (s.prestigeLevel>0) ? `${operatorTitle(s)} · Prestige ${s.prestigeLevel}` : 'Data Center Tycoon';
  document.getElementById('hud-cash').textContent = money(s.cash);
  document.getElementById('hud-cash').style.color = s.cash<0 ? 'var(--red)' : '';

  const net = netCashFlow(s);
  const netEl = document.getElementById('hud-netflow');
  netEl.textContent = `${signedMoney(net)}/day`;
  netEl.style.color = net>=0 ? 'var(--green)' : 'var(--red)';

  document.getElementById('hud-power').textContent = `${fmt(d.powerUse)}/${fmt(d.powerCap)} MW`;
  document.getElementById('hud-cpu').textContent = `${fmt(d.computeUsedCpu)}/${fmt(d.computeCapCpu)} PF`;
  document.getElementById('hud-gpu').textContent = `${fmt(d.computeUsedGpu)}/${fmt(d.computeCapGpu)} PF`;
  document.getElementById('hud-rep').textContent = Math.round(s.reputation);
  document.getElementById('hud-research').textContent = Math.round(s.research);
  document.getElementById('hud-day').textContent = s.day;

  const rareStat = document.getElementById('hud-rare-stat');
  if (s.facilities.supply.unlocked){
    rareStat.classList.remove('hidden');
    document.getElementById('hud-rare').textContent = Math.floor(s.rareAlloys);
  } else {
    rareStat.classList.add('hidden');
  }

  const coreStat = document.getElementById('hud-core-stat');
  if (s.singularityUnlocked || s.singularityCores>0){
    coreStat.classList.remove('hidden');
    document.getElementById('hud-core').textContent = s.singularityCores.toFixed(1);
  } else {
    coreStat.classList.add('hidden');
  }

  document.getElementById('bar-power').style.width = `${clamp(d.powerCap? d.powerUse/d.powerCap*100:0,0,100)}%`;
  document.getElementById('bar-power').className = 'stat-bar-fill ' + (d.powerOk?'fill-amber':'');
  if (!d.powerOk) document.getElementById('bar-power').style.background = 'var(--red)';
  document.getElementById('bar-cpu').style.width = `${clamp(d.computeCapCpu? d.computeUsedCpu/d.computeCapCpu*100:0,0,100)}%`;
  document.getElementById('bar-gpu').style.width = `${clamp(d.computeCapGpu? d.computeUsedGpu/d.computeCapGpu*100:0,0,100)}%`;
  document.getElementById('bar-rep').style.width = `${s.reputation}%`;

  // PUE and storage figures are shown directly on their category cards now.

  const badge = document.getElementById('badge-contracts');
  if (s.contracts.available.length>0){ badge.textContent = s.contracts.available.length; badge.classList.remove('hidden'); }
  else badge.classList.add('hidden');

  const statusMsg = document.getElementById('statusbar-msg');
  const grace = s.effects.find(e=>e.id==='grace');
  if (!d.powerOk) statusMsg.textContent = '⚠ Power capacity exceeded: build more generation.';
  else if (grace) statusMsg.textContent = `🟢 Grace period: day ${s.day} of 7 — reduced costs, no incidents. Good time to accept your first contract.`;
  else if (allSlots(s).filter(sl=>sl.building).length===0) statusMsg.textContent = 'Open a facility and place your first power source to get started.';
  else statusMsg.textContent = `Operational — day ${s.day}, ${allSlots(s).filter(sl=>sl.building).length} building(s) active.`;

  document.getElementById('statusbar-achv').textContent = `🏆 ${s.achievements.length}/${ACHIEVEMENTS.length}`;
}

/* ---- Category dashboard cards ---- */

function categorySummary(s, catId){
  const d = computeDerived(s);
  const fac = s.facilities[catId];
  const built = fac.slots.filter(sl=>sl.building).length;
  switch(catId){
    case 'power':    return `${fmt(d.powerUse)}/${fmt(d.powerCap)} MW`;
    case 'cpu':      return `${fmt(d.computeUsedCpu)}/${fmt(d.computeCapCpu)} PF`;
    case 'gpu':      return `${fmt(d.computeUsedGpu)}/${fmt(d.computeCapGpu)} PF`;
    case 'storage':  return `${fmt(d.storageUsed)}/${fmt(d.storageCap)} TB`;
    case 'cooling':  return `PUE ${d.pue.toFixed(2)}`;
    case 'security': return `${Math.round(cyberDefense(s)*100)}% defense`;
    case 'rnd': {
      let rp=0; for (const sl of fac.slots) if (sl.building) rp += BUILDING_DEFS[sl.building.type].researchPerDay*levelMult(sl.building.level);
      return `+${rp.toFixed(1)} RP/day`;
    }
    case 'supply': {
      if (!fac.unlocked) return 'Locked';
      let rp=0; for (const sl of fac.slots) if (sl.building && BUILDING_DEFS[sl.building.type].rarePerDay) rp += BUILDING_DEFS[sl.building.type].rarePerDay*levelMult(sl.building.level);
      const hasFab = fac.slots.some(sl=>sl.building && BUILDING_DEFS[sl.building.type].coreOutPerDay);
      return `+${rp.toFixed(1)} alloys/day${hasFab?' · refining cores':''}`;
    }
  }
  return `${built} built`;
}

function renderCategoryCards(){
  const s = state;
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';
  for (const catId of CATEGORY_ORDER){
    const cat = CATEGORIES[catId];
    const fac = s.facilities[catId];
    const el = document.createElement('div');
    if (catId==='supply' && !fac.unlocked){
      el.className = 'cat-card locked';
      el.innerHTML = `<div class="cat-icon">🔒</div><div class="cat-name">${cat.name}</div><div class="cat-sub">Unlocks with research</div>`;
    } else {
      const built = fac.slots.filter(sl=>sl.building).length;
      const hasIssue = catId==='power' && !computeDerived(s).powerOk;
      const hasTier3 = fac.slots.some(sl=>sl.building && BUILDING_DEFS[sl.building.type].tier===3);
      el.className = 'cat-card' + (hasIssue?' issue':'') + (hasTier3?' singularity-card':'');
      el.innerHTML = `
        <div class="cat-icon">${cat.icon}</div>
        <div class="cat-name">${cat.name}</div>
        <div class="cat-value mono">${categorySummary(s, catId)}</div>
        <div class="cat-sub">${built}/${fac.slots.length} slots built</div>`;
      el.addEventListener('click', ()=>openCategoryModal(catId));
    }
    grid.appendChild(el);
  }
}

/* ---- Staff panel ---- */

function renderStaffPanel(){
  const panel = document.getElementById('panel-staff');
  const s = state;
  let html = `<div class="panel-title">Staff (payroll: ${money(dailySalaries(s))}/day)</div>`;
  for (const type in STAFF_TYPES){
    const def = STAFF_TYPES[type];
    const nextCost = staffHireCost(type);
    html += `<div class="staff-card">
      <div class="staff-card-head"><h4>${def.name}</h4><span class="staff-count mono">${s.staff[type]}</span></div>
      <p style="margin:0 0 8px;font-size:11.5px;color:var(--text-dim);">${def.desc}</p>
      <div class="staff-row" style="justify-content:space-between;">
        <span class="mono" style="font-size:11px;color:var(--text-dim);">Next hire ${money(nextCost)} · Salary ${money(def.salary)}/day</span>
        <div class="stepper">
          <button data-action="fire" data-type="${type}">−</button>
          <button data-action="hire" data-type="${type}">+</button>
        </div>
      </div>
    </div>`;
  }
  if (s.staff.manager>0){
    const pct = clamp(s.autoAcceptProgress/AUTO_ACCEPT_CYCLE*100, 0, 100);
    html += `<div class="panel-title" style="margin-top:14px;">Auto-accept progress</div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:var(--violet);"></div></div>
      <p class="empty-state" style="padding:8px 0 0;">${s.staff.manager} manager(s) — ${s.stats.autoAccepted} contracts auto-accepted so far.</p>`;
  }
  panel.innerHTML = html;
  panel.querySelectorAll('[data-action="hire"]').forEach(b=>b.addEventListener('click', ()=>hireStaff(b.dataset.type)));
  panel.querySelectorAll('[data-action="fire"]').forEach(b=>b.addEventListener('click', ()=>fireStaff(b.dataset.type)));
}

/* ---- Contracts panel ---- */

function renderContractsPanel(){
  const panel = document.getElementById('panel-contracts');
  const s = state;
  let html = '';
  if (s.staff.manager>0){
    const pct = clamp(s.autoAcceptProgress/AUTO_ACCEPT_CYCLE*100, 0, 100);
    html += `<div class="auto-accept-banner">🤖 ${s.staff.manager} Account Manager(s) active — auto-accepting fitting contracts.
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:var(--violet);"></div></div>
    </div>`;
  }
  html += `<div class="panel-title">Available contracts</div>`;
  if (s.contracts.available.length===0) html += `<p class="empty-state">No contracts right now. Hire sales reps to attract more.</p>`;
  for (const c of s.contracts.available){
    html += `<div class="contract-card type-${c.type}${c.enterprise?' enterprise':''}${c.singularity?' singularity':''}">
      <div class="contract-head"><h4>${c.client}${c.singularity?' <span class="tag tag-singularity">Singularity</span>':c.enterprise?' <span class="tag tag-enterprise">Enterprise</span>':''}</h4><span class="contract-type">${contractLabel(c.type)}</span></div>
      <div class="contract-body">
        ${c.type==='storage' ? `Needs: <b>${c.storageAmt} TB</b> storage` : `Needs: <b>${c.amount} PF</b> ${c.computeType.toUpperCase()}`}<br>
        Duration: <b>${c.duration} days</b> ·
        ${c.dailyPay? ` ${money(c.dailyPay)}/day`:''}${c.lump? ` + ${money(c.lump)} bonus on completion`:''}<br>
        Reputation: <b>+${c.repGain}</b> on success / <b>-${c.repLoss}</b> on failure
      </div>
      <div class="contract-actions">
        <span class="contract-expire">expires in ${c.expiresIn}d</span>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" data-action="decline" data-id="${c.id}">Decline</button>
          <button class="btn btn-primary btn-sm" data-action="accept" data-id="${c.id}">Accept</button>
        </div>
      </div>
    </div>`;
  }
  html += `<div class="panel-title" style="margin-top:16px;">Active contracts (${s.contracts.active.length})</div>`;
  if (s.contracts.active.length===0) html += `<p class="empty-state">No active contracts.</p>`;
  for (const c of s.contracts.active){
    const pct = Math.round((1 - c.duration/c.totalDuration)*100);
    html += `<div class="contract-card type-${c.type}">
      <div class="contract-head"><h4>${c.client}</h4><span class="contract-type">${contractLabel(c.type)}</span></div>
      <div class="contract-body">${c.duration} day(s) left${c.dailyPay? ` · ${money(c.dailyPay)}/day`:''}</div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }
  panel.innerHTML = html;
  panel.querySelectorAll('[data-action="accept"]').forEach(b=>b.addEventListener('click', ()=>acceptContract(b.dataset.id)));
  panel.querySelectorAll('[data-action="decline"]').forEach(b=>b.addEventListener('click', ()=>declineContract(b.dataset.id)));
}

/* ---- Research panel ---- */

function renderResearchPanel(){
  const panel = document.getElementById('panel-research');
  const s = state;
  let html = `<div class="panel-title">Tech tree · ${Math.round(s.research)} pts${s.facilities.supply.unlocked?` · ${Math.floor(s.rareAlloys)} 💠`:''}${s.singularityUnlocked||s.singularityCores>0?` · ${s.singularityCores.toFixed(1)} 🔮`:''}</div>`;

  const groups = [
    { label:'Efficiency & Scaling', items: TECH_TREE.filter(t=>t.kind==='level') },
    { label:'Advanced Hardware (Tier 2)', items: TECH_TREE.filter(t=>t.kind==='unlock' && BUILDING_DEFS[t.unlocks].tier===2) },
    { label:'Singularity Programs (Tier 3)', items: TECH_TREE.filter(t=>t.kind==='unlock' && BUILDING_DEFS[t.unlocks].tier===3) },
  ];

  for (const group of groups){
    html += `<div class="panel-title" style="margin-top:14px;">${group.label}</div>`;
    for (const tech of group.items){
      const lvl = techLevel(s, tech.id);
      const maxLvl = tech.kind==='unlock' ? 1 : tech.maxLevel;
      const done = lvl >= maxLvl;
      const infraOk = tech.kind!=='unlock' || meetsInfraReq(s, tech.infraReq);
      const locked = !done && !canResearch(s, tech.id);
      const cost = techCost(tech, lvl);
      html += `<div class="tech-card ${done?'done':locked?'locked':''}">
        <div class="tech-head"><h4>${tech.name}${tech.kind==='level'?` <span class="tech-level mono">Lv.${lvl}/${maxLvl}</span>`:''}</h4>${!done?`<span class="tech-cost mono">${cost.research} pts${cost.rare?` + ${cost.rare} 💠`:''}${cost.core?` + ${cost.core} 🔮`:''}</span>`:''}</div>
        <p>${tech.desc(lvl)}${tech.requires.length? `<br><i>Requires: ${tech.requires.map(r=>TECH_TREE.find(t=>t.id===r).name).join(', ')}</i>`:''}${tech.kind==='unlock' && !infraOk ? `<br><i style="color:var(--amber);">Also needs: ${infraReqLabel(tech.infraReq)}.</i>`:''}</p>
        ${!done? `<button class="btn btn-secondary btn-block" data-action="research" data-id="${tech.id}" ${locked?'disabled':''}>${locked?'Locked':(tech.kind==='unlock'?'Unlock':'Research next level')}</button>`:''}
      </div>`;
    }
  }
  panel.innerHTML = html;
  panel.querySelectorAll('[data-action="research"]').forEach(b=>b.addEventListener('click', ()=>researchTech(b.dataset.id)));
}

function renderLogPanel(){
  const panel = document.getElementById('panel-log');
  const s = state;
  if (s.log.length===0){ panel.innerHTML = `<p class="empty-state">The operations log will appear here.</p>`; return; }
  panel.innerHTML = s.log.slice(0,80).map(e=>`<div class="log-entry ${e.kind}"><span class="log-day mono">D${e.day}</span><span>${e.text}</span></div>`).join('');
}

/* ================= TOASTS ================= */

function toast(text, kind){
  const row = document.getElementById('toast-row');
  const el = document.createElement('div');
  el.className = 'toast ' + (kind||'');
  el.textContent = text;
  row.appendChild(el);
  setTimeout(()=>el.remove(), 4200);
}

/* ================= CATEGORY MODAL (facility slot grid) ================= */

let currentModalCategory = null;

function closeModal(){
  document.getElementById('modal-overlay').classList.add('hidden');
  currentModalCategory = null;
}

function slotStatusLed(s, slot){
  if (!slot.building) return null;
  const d = computeDerived(s);
  const def = BUILDING_DEFS[slot.building.type];
  if (def.category==='power' && !d.powerOk) return 'red';
  if (s.effects.some(e=>e.id==='heatwave'||e.id==='blackout')) return 'amber';
  return 'green';
}

/* Short at-a-glance output label + color for a built building. */
function buildingOutput(key, level){
  const def = BUILDING_DEFS[key];
  const mult = levelMult(level);
  if (def.power) return { text:`+${Math.round(def.power*mult)} MW`, color:'var(--amber)', hint:'Power produced' };
  if (def.compute) return { text:`+${Math.round(def.compute*mult)} PF ${def.category==='gpu'?'GPU':'CPU'}`, color: def.category==='gpu' ? 'var(--violet)' : 'var(--cyan)', hint:`Compute produced — sold via Contracts` };
  if (def.storage) return { text:`+${Math.round(def.storage*mult)} TB`, color:'var(--amber)', hint:'Storage capacity produced' };
  if (def.researchPerDay) return { text:`+${(def.researchPerDay*mult).toFixed(1)} RP/d`, color:'var(--violet)', hint:'Research points produced' };
  if (def.rarePerDay) return { text:`+${(def.rarePerDay*mult).toFixed(1)}/d`, color:'var(--amber)', hint:'Rare alloys produced' };
  if (def.coreOutPerDay) return { text:`+${(def.coreOutPerDay*mult).toFixed(2)} 🔮/d`, color:'var(--violet)', hint:`Refines ${(def.alloyConsumePerDay*mult).toFixed(1)} rare alloys/day into singularity cores` };
  if (def.coolingPower) return { text:'Cooling', color:'var(--text-faint)', hint:'Lowers PUE, prevents heatwave/overload penalties' };
  if (def.defensePower) return { text:'Defense', color:'var(--text-faint)', hint:'Reduces cyberattack damage' };
  return { text:'', color:'var(--text-faint)', hint:'' };
}

function openCategoryModal(catId){
  currentModalCategory = catId;
  renderCategoryModal(catId);
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function renderCategoryModal(catId){
  const s = state;
  const cat = CATEGORIES[catId];
  const fac = s.facilities[catId];
  const box = document.getElementById('modal-box');
  box.className = 'modal-box modal-box-lg';

  let grid = `<div class="slot-grid">`;
  fac.slots.forEach(slot=>{
    if (!slot.building){
      grid += `<div class="plot empty" data-slot="${slot.id}"><div class="plot-plus">+</div><div class="plot-name">Build</div></div>`;
    } else {
      const def = BUILDING_DEFS[slot.building.type];
      const led = slotStatusLed(s, slot);
      const out = buildingOutput(slot.building.type, slot.building.level);
      grid += `<div class="plot built" data-slot="${slot.id}" title="${def.name} (Lvl ${slot.building.level}) — click to manage">
        <span class="plot-led led led-${led}"></span>
        <div class="plot-icon">${def.icon}</div>
        <div class="plot-name">${def.name}</div>
        <div class="plot-produce mono" style="color:${out.color}">${out.text}</div>
        <div class="plot-level">Lvl ${slot.building.level}</div>
      </div>`;
    }
  });
  grid += `</div>`;

  const expandCost = nextExpandCost(s, catId);
  box.innerHTML = `
    <div class="modal-cat-head">
      <h3>${cat.icon} ${cat.name}</h3>
      <button class="btn btn-ghost btn-sm" id="modal-close">✕</button>
    </div>
    <p class="modal-sub">${cat.desc}</p>
    ${grid}
    <div class="modal-cat-footer">
      <span class="mono" style="font-size:11px;color:var(--text-dim);">${fac.slots.length} slots · ${fac.slots.filter(sl=>sl.building).length} built</span>
      <button class="btn btn-secondary btn-sm" id="modal-expand">Expand (+4 slots — ${money(expandCost)})</button>
    </div>
  `;
  box.querySelectorAll('.plot.empty').forEach(el=>el.addEventListener('click', ()=>renderSlotBuildChoice(catId, Number(el.dataset.slot))));
  box.querySelectorAll('.plot.built').forEach(el=>el.addEventListener('click', ()=>renderSlotManage(catId, Number(el.dataset.slot))));
  document.getElementById('modal-expand').addEventListener('click', ()=>expandCategory(catId));
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function renderSlotBuildChoice(catId, slotId){
  const s = state;
  const cat = CATEGORIES[catId];
  const box = document.getElementById('modal-box');
  const options = buildingsForCategory(catId);
  let html = `
    <div class="modal-cat-head">
      <button class="btn btn-ghost btn-sm" id="modal-back">← ${cat.name}</button>
      <button class="btn btn-ghost btn-sm" id="modal-close">✕</button>
    </div>
    <h3>Build — ${cat.name} slot</h3>
    <p class="modal-sub">Choose a building type.</p>`;
  for (const { key, def } of options){
    const unlocked = isBuildingUnlocked(s, key);
    const cost = buildingCost(s, key);
    const afford = s.cash >= cost && (!def.rareCost || s.rareAlloys >= def.rareCost) && (!def.coreCost || s.singularityCores >= def.coreCost);
    const tagClass = def.tier===1?'starter':def.tier===2?'advanced':'singularity';
    html += `<div class="build-card ${unlocked?'':'locked-building'}">
      <div class="build-card-head"><h4>${def.icon} ${def.name} <span class="tag tag-${tagClass}">${BUILDING_TIER_LABEL[def.tier]}</span></h4><span class="build-card-price">${money(cost)}${def.rareCost?` + ${def.rareCost}💠`:''}${def.coreCost?` + ${def.coreCost}🔮`:''}</span></div>
      <p>${def.desc}</p>
      ${unlocked
        ? `<button class="btn btn-primary btn-block" data-action="build" data-key="${key}" ${afford?'':'disabled'}>${afford?'Build':'Not enough resources'}</button>`
        : `<button class="btn btn-ghost btn-block" disabled>🔒 Research ${TECH_TREE.find(t=>t.unlocks===key)?.name||'unlock tech'} first</button>`}
    </div>`;
  }
  box.innerHTML = html;
  box.querySelectorAll('[data-action="build"]').forEach(b=>b.addEventListener('click', ()=>{ buildOnSlot(catId, slotId, b.dataset.key); renderCategoryModal(catId); }));
  document.getElementById('modal-back').addEventListener('click', ()=>renderCategoryModal(catId));
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function nextTierBuilding(catId, fromTier){
  return buildingsForCategory(catId).find(b => b.def.tier === fromTier+1) || null;
}

function upgradeToNextTier(catId, slotId){
  const s = state;
  const slot = s.facilities[catId].slots.find(sl=>sl.id===slotId);
  if (!slot || !slot.building) return;
  const oldDef = BUILDING_DEFS[slot.building.type];
  const next = nextTierBuilding(catId, oldDef.tier);
  if (!next || !isBuildingUnlocked(s, next.key)) return;
  const baseCost = buildingCost(s, next.key);
  const tradeIn = Math.round(oldDef.cost * 0.3 * slot.building.level);
  const cost = Math.max(Math.round(next.def.cost*0.4), baseCost - tradeIn);
  if (s.cash < cost) { toast('Not enough cash for this upgrade.', 'bad'); return; }
  if (next.def.rareCost && s.rareAlloys < next.def.rareCost) { toast(`Not enough rare alloys (need ${next.def.rareCost}).`, 'bad'); return; }
  if (next.def.coreCost && s.singularityCores < next.def.coreCost) { toast(`Not enough singularity cores (need ${next.def.coreCost}).`, 'bad'); return; }
  s.cash -= cost;
  if (next.def.rareCost) s.rareAlloys -= next.def.rareCost;
  if (next.def.coreCost) s.singularityCores -= next.def.coreCost;
  slot.building = { type: next.key, level:1, builtDay: s.day };
  log(s, `Upgraded: ${oldDef.name} → ${next.def.name} (${CATEGORIES[catId].name}) for ${money(cost)}${next.def.rareCost?` + ${next.def.rareCost} alloys`:''}${next.def.coreCost?` + ${next.def.coreCost} cores`:''} (trade-in credit ${money(tradeIn)}).`, 'good');
  toast(`⬆ ${oldDef.name} upgraded to ${next.def.name}!`, 'good');
  if (next.def.tier===3) markSingularityReached(s);
  renderCategoryModal(catId);
  renderAll();
}

function renderSlotManage(catId, slotId){
  const s = state;
  const cat = CATEGORIES[catId];
  const fac = s.facilities[catId];
  const slot = fac.slots.find(sl=>sl.id===slotId);
  const def = BUILDING_DEFS[slot.building.type];
  const box = document.getElementById('modal-box');
  const upCost = Math.round(def.cost*0.65*slot.building.level);
  const demCost = Math.round(def.cost*0.3*slot.building.level);
  const maxed = slot.building.level >= maxBuildingLevel(s);
  const out = buildingOutput(slot.building.type, slot.building.level);
  const rows = out.text
    ? `<div class="modal-row"><span>Produces</span><b style="color:${out.color}">${out.text}</b></div>
       <div class="modal-row"><span>Used for</span><b style="text-align:right;max-width:220px;font-weight:500;">${out.hint}</b></div>`
    : `<div class="modal-row"><span>Effect</span><b style="text-align:right;max-width:220px;">${out.hint}</b></div>`;

  let tier2Box = '';
  const nextTier = def.tier < 3 ? nextTierBuilding(catId, def.tier) : null;
  if (nextTier){
    const unlocked = isBuildingUnlocked(s, nextTier.key);
    if (unlocked){
      const baseCost = buildingCost(s, nextTier.key);
      const tradeIn = Math.round(def.cost * 0.3 * slot.building.level);
      const cost = Math.max(Math.round(nextTier.def.cost*0.4), baseCost - tradeIn);
      const afford = s.cash>=cost && (!nextTier.def.rareCost || s.rareAlloys>=nextTier.def.rareCost) && (!nextTier.def.coreCost || s.singularityCores>=nextTier.def.coreCost);
      tier2Box = `<div class="tier2-upgrade-box">
        <p class="modal-sub" style="margin:0 0 8px;">${nextTier.def.icon} Convert this slot into a <b>${nextTier.def.name}</b> — trade-in credit ${money(tradeIn)} applied.</p>
        <button class="btn btn-primary btn-block" id="modal-tier2" ${afford?'':'disabled'}>⬆ Upgrade to ${nextTier.def.name} (${money(cost)}${nextTier.def.rareCost?` + ${nextTier.def.rareCost} 💠`:''}${nextTier.def.coreCost?` + ${nextTier.def.coreCost} 🔮`:''})</button>
      </div>`;
    } else {
      const unlockTech = TECH_TREE.find(t=>t.unlocks===nextTier.key);
      tier2Box = `<div class="tier2-upgrade-box locked"><p class="modal-sub" style="margin:0;">🔒 Research <b>${unlockTech?.name}</b> to unlock converting this into a ${nextTier.def.name}.${unlockTech?.infraReq?`<br><i>Also needs: ${infraReqLabel(unlockTech.infraReq)}.</i>`:''}</p></div>`;
    }
  }

  box.innerHTML = `
    <div class="modal-cat-head">
      <button class="btn btn-ghost btn-sm" id="modal-back">← ${cat.name}</button>
      <button class="btn btn-ghost btn-sm" id="modal-close">✕</button>
    </div>
    <h3>${def.icon} ${def.name}</h3>
    <p class="modal-sub">Level ${slot.building.level}${maxed?' (max)':''}</p>
    ${rows}
    <div class="modal-row"><span>Built on</span><b>Day ${slot.building.builtDay}</b></div>
    <div class="modal-row"><span>Upkeep</span><b>${money(def.upkeep*slot.building.level)}/day</b></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-upgrade" ${maxed?'disabled':''}>${maxed?'Max level':`Upgrade (${money(upCost)})`}</button>
      <button class="btn btn-danger" id="modal-demolish">Demolish (+${money(demCost)})</button>
    </div>
    ${tier2Box}
  `;
  document.getElementById('modal-upgrade').addEventListener('click', ()=>{ upgradeSlot(catId, slotId); renderSlotManage(catId, slotId); });
  document.getElementById('modal-demolish').addEventListener('click', ()=>{ demolishSlot(catId, slotId); renderCategoryModal(catId); });
  document.getElementById('modal-back').addEventListener('click', ()=>renderCategoryModal(catId));
  document.getElementById('modal-close').addEventListener('click', closeModal);
  const t2btn = document.getElementById('modal-tier2');
  if (t2btn) t2btn.addEventListener('click', ()=>{ upgradeToNextTier(catId, slotId); renderSlotManage(catId, slotId); });
}

/* ================= END GAME / MENU / PRESTIGE MODALS ================= */

function showGameOver(){
  setSpeed(0);
  closeModal();
  const box = document.getElementById('modal-box');
  box.className = 'modal-box';
  box.innerHTML = `
    <h3>💀 Bankruptcy</h3>
    <p class="modal-sub">Your operation went bankrupt on day ${state.day}.</p>
    <div class="modal-row"><span>Days survived</span><b>${state.day}</b></div>
    <div class="modal-row"><span>Contracts completed</span><b>${state.stats.contractsCompleted}</b></div>
    <div class="modal-row"><span>Achievements unlocked</span><b>${state.achievements.length}/${ACHIEVEMENTS.length}</b></div>
    <div class="modal-actions"><button class="btn btn-primary btn-block" id="modal-restart">Start over</button></div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-restart').addEventListener('click', ()=>{
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });
}

function operatorTitle(s){
  const idx = Math.min(s.prestigeLevel||0, PRESTIGE_TITLES.length-1);
  return PRESTIGE_TITLES[idx];
}

function openMenuModal(){
  closeModal();
  const box = document.getElementById('modal-box');
  box.className = 'modal-box';
  const level = state.prestigeLevel||0;
  const eligible = state.cash >= PRESTIGE_MIN_CASH;
  const nextLevel = level+1;
  box.innerHTML = `
    <h3>Menu</h3>
    <p class="modal-sub">${state.operator} · ${operatorTitle(state)} · Day ${state.day}</p>
    <div class="modal-row"><span>Prestige level</span><b>${level}</b></div>
    <div class="modal-row"><span>Permanent income bonus</span><b>+${level*15}%</b></div>
    <div class="modal-row"><span>Permanent reputation bonus</span><b>+${level*10}%</b></div>
    <div class="ipo-box">
      <p class="modal-sub" style="margin:0 0 10px;">Going public resets your facilities, cash, staff and research back to a fresh start — but permanently raises contract income and reputation gains for every run from now on, and keeps your achievements.</p>
      <button class="btn btn-primary btn-block" id="modal-menu-ipo" ${eligible?'':'disabled'}>🚀 ${eligible? `Go public (Prestige ${nextLevel})` : `Go public (needs ${money(PRESTIGE_MIN_CASH)})`}</button>
    </div>
    <div class="modal-actions" style="flex-direction:column;margin-top:14px;">
      <button class="btn btn-secondary btn-block" id="modal-menu-save">💾 Save game</button>
      <button class="btn btn-danger btn-block" id="modal-menu-reset">Reset game</button>
      <button class="btn btn-ghost btn-block" id="modal-close">Close</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-menu-save').addEventListener('click', ()=>{ autoSave(); toast('Game saved.', 'good'); closeModal(); });
  document.getElementById('modal-menu-ipo').addEventListener('click', doIPO);
  document.getElementById('modal-menu-reset').addEventListener('click', ()=>{
    if (confirm('Permanently reset the game?')){ localStorage.removeItem(SAVE_KEY); location.reload(); }
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function doIPO(){
  const s = state;
  if (s.cash < PRESTIGE_MIN_CASH){ toast(`You need at least ${money(PRESTIGE_MIN_CASH)} in cash to go public.`, 'bad'); return; }
  if (!confirm(`Go public now? This resets your facilities, cash, staff and research to a fresh start, but permanently raises contract income and reputation gains by another +15%/+10% for every future run. This can\u2019t be undone.`)) return;

  const operatorName = s.operator;
  const achievements = s.achievements.slice();
  const newLevel = (s.prestigeLevel||0) + 1;

  state = freshState(operatorName, newLevel);
  state.achievements = achievements;
  state.tutorialDone = true; // no need to re-run the new-operator tutorial after a prestige

  log(state, `🚀 ${operatorName} goes public! Prestige level ${newLevel} reached — permanent +${newLevel*15}% contract income and +${newLevel*10}% reputation gains, forever.`, 'achv');
  toast(`🚀 IPO complete — welcome to Prestige Level ${newLevel}, ${operatorTitle(state)}.`, 'achv');
  closeModal();
  refreshContractPool(state);
  renderAll();
  setSpeed(1);
  autoSave();
}

/* ================= SAVE / LOAD ================= */

function autoSave(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e){ /* storage unavailable */ }
}
function loadSave(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e){ return null; }
}

/* ================= INIT ================= */

function initTabs(){
  document.querySelectorAll('.deck-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('.deck-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.deck-panel').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
    });
  });
}

function initSpeedControls(){
  document.querySelectorAll('.speed-btn').forEach(b=>{
    b.addEventListener('click', ()=>setSpeed(Number(b.dataset.speed)));
  });
}

function startGame(existing){
  state = existing || freshState(document.getElementById('operator-name').value.trim());
  document.getElementById('boot-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  if (state.singularityUnlocked) document.body.classList.add('singularity-theme');
  refreshContractPool(state);
  renderAll();
  setSpeed(1);
  if (!existing){
    log(state, `${state.operator} comes online. Welcome to the age of compute.`, 'good');
    startTutorial();
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  initTabs();
  initSpeedControls();

  // Safety net: force a save if the tab is closed, refreshed, or backgrounded —
  // covers any future code path that mutates state without going through renderAll().
  window.addEventListener('beforeunload', ()=>{ if (state) autoSave(); });
  document.addEventListener('visibilitychange', ()=>{ if (state && document.visibilityState==='hidden') autoSave(); });

  document.getElementById('modal-overlay').addEventListener('click', (e)=>{
    if (e.target.id==='modal-overlay') closeModal();
  });

  const existing = loadSave();
  if (existing){
    document.getElementById('btn-continue').classList.remove('hidden');
    document.getElementById('btn-continue').addEventListener('click', ()=>startGame(existing));
  }
  document.getElementById('btn-start').addEventListener('click', ()=>startGame(null));
  document.getElementById('operator-name').addEventListener('keydown', (e)=>{ if (e.key==='Enter') startGame(null); });

  document.getElementById('btn-save').addEventListener('click', ()=>{ autoSave(); toast('Game saved.', 'good'); });
  document.getElementById('btn-menu').addEventListener('click', openMenuModal);
  document.getElementById('btn-help').addEventListener('click', ()=>startTutorial());

  document.getElementById('tutorial-next').addEventListener('click', nextTutorialStep);
  document.getElementById('tutorial-back').addEventListener('click', prevTutorialStep);
  document.getElementById('tutorial-skip').addEventListener('click', endTutorial);

  document.getElementById('tip-banner-close').addEventListener('click', ()=>{
    state.tipsDismissed = true;
    renderTipBanner();
    autoSave();
  });
});
