import { useState, useCallback, useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button } from '@mui/material';
import { store } from './store';
import { setPlanets, setConnections } from './store/starMapSlice';
import theme from './theme/theme';
import './theme/global.css';
import LoginScreen from './pages/LoginScreen';
import LobbyScreen from './pages/LobbyScreen';
import GameScene from './pages/GameScene';
import LoadingSpinner from './fx/LoadingSpinner';
import TradeModal from './modals/TradeModal';
import type { GoodsCard, CargoSlotItem } from './modals/TradeModal';
import { MiniTradePanel } from './modals/TradeModal';
import EncounterModal from './modals/EncounterModal';
import SettlementScreen from './modals/SettlementScreen';
import type { SettlementData } from './modals/SettlementScreen';
import DevPanel from './modals/DevPanel';
import { pushWorldToast } from './fx/worldEventBus';
import { fetchStarMap } from './api/starMapApi';
import type { TopHUDProps } from './hud/TopHUD';
import type { RightCargoPanelProps } from './hud/RightCargoPanel';
import type { BottomInfoBarProps } from './hud/BottomInfoBar';
import colors from './theme/colors';

/* ---- HUD mock data ---- */
const MOCK_TOP_HUD: Omit<TopHUDProps, 'onEndGame'> = {
  credits: 12450,
  previousCredits: 13000,
  status: 'EXPLORING',
  galacticYear: 2149,
  actionPoints: 47,
  maxActionPoints: 100,
  wantedLevel: 1,
};

const MOCK_CARGO_SLOTS: RightCargoPanelProps['slots'] = [
  { goodsId: 2, goodsName: '高能晶体', quantity: 12, avgCost: 340, isContraband: false },
  { goodsId: 5, goodsName: '医疗药剂', quantity: 5, avgCost: 180, isContraband: false },
  { goodsId: 8, goodsName: '走私艺术品', quantity: 3, avgCost: 1200, isContraband: true },
  null, null, null, null, null,
];

const MOCK_MONOPOLY: BottomInfoBarProps['monopolyItems'] = [
  { goodsId: 1, goodsName: '标准矿石', shortName: '矿石', icon: '', ratio: 0.45 },
  { goodsId: 2, goodsName: '高能晶体', shortName: '晶体', icon: '', ratio: 0.72 },
  { goodsId: 3, goodsName: '精密零件', shortName: '零件', icon: '', ratio: 0.83 },
  { goodsId: 4, goodsName: '星际芯片', shortName: '芯片', icon: '', ratio: 0.30 },
  { goodsId: 5, goodsName: '医疗药剂', shortName: '药剂', icon: '', ratio: 0.55 },
  { goodsId: 6, goodsName: '生物样本', shortName: '样本', icon: '', ratio: 0.18 },
  { goodsId: 7, goodsName: '暗物质核心', shortName: '暗物质', icon: '', ratio: 0.91 },
  { goodsId: 8, goodsName: '走私艺术品', shortName: '艺术品', icon: '', ratio: 0.68 },
];

/* ---- trade modal mock ---- */
const MOCK_STATION_GOODS: GoodsCard[] = [
  { goodsId: 1, goodsName: '标准矿石', currentPrice: 280, stock: 45, isContraband: false, isLocked: false },
  { goodsId: 2, goodsName: '高能晶体', currentPrice: 340, previousPrice: 380, stock: 12, isContraband: false, isLocked: false },
  { goodsId: 3, goodsName: '精密零件', currentPrice: 1200, stock: 8, isContraband: false, isLocked: true, lockReason: '通缉等级限制' },
  { goodsId: 4, goodsName: '星际芯片', currentPrice: 580, previousPrice: 520, stock: 22, isContraband: false, isLocked: false },
  { goodsId: 5, goodsName: '医疗药剂', currentPrice: 180, stock: 60, isContraband: false, isLocked: false },
  { goodsId: 8, goodsName: '走私艺术品', currentPrice: 1200, stock: 5, isContraband: true, isLocked: false },
];

const MOCK_CARGO: CargoSlotItem[] = [
  { goodsId: 2, goodsName: '高能晶体', quantity: 12, avgCost: 340 },
  { goodsId: 5, goodsName: '医疗药剂', quantity: 5, avgCost: 180 },
  { goodsId: 8, goodsName: '走私艺术品', quantity: 3, avgCost: 1200, isContraband: true },
];

/* ---- encounter mock ---- */
const MOCK_ENCOUNTER = {
  title: '暗影走私商',
  description: '一艘未标识的飞船向你发来加密通讯。船长声称有一批高能晶体，愿意以低于市场价 30% 的价格出售。但通讯中隐约可见飞船侧舷的通缉标志...',
  choices: [
    { choiceId: 1, text: '接受货物', consequenceHint: '风险：+50 可疑度 | 收益：+20 单位高能晶体' },
    { choiceId: 2, text: '举报走私商', consequenceHint: '风险：无 | 收益：+500 CR 奖金' },
    { choiceId: 3, text: '假装没看见并离开', consequenceHint: '风险：无 | 收益：无' },
  ],
};

/* ---- settlement mock ---- */
const MOCK_SETTLEMENT: SettlementData = {
  result: 'won',
  playerName: '星际物流长',
  finalCredits: 45200,
  monopolyCount: 2,
  tradeCount: 34,
  eventCount: 7,
  breakdown: {
    creditsBonus: 22600,
    monopolyBonus: 10000,
    tradeBonus: 3400,
    eventBonus: 1400,
    total: 37400,
  },
};

/* ---- loading messages ---- */
const LOADING_MESSAGES = [
  '正在初始化星图网络...',
  '正在同步市场数据...',
  '正在校准跃迁引擎...',
];

/* ---- app state ---- */
type Screen = 'login' | 'lobby' | 'loading' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [playerName, setPlayerName] = useState('');
  const canvasRef = useRef<HTMLDivElement | null>(null);

  /* ---- modal demo state ---- */
  const [tradeOpen, setTradeOpen] = useState(false);
  const [miniTrade, setMiniTrade] = useState<GoodsCard | null>(null);
  const [encounterOpen, setEncounterOpen] = useState(false);
  const [encounterResult, setEncounterResult] = useState<{ success: boolean; message: string } | null>(null);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  /* ---- loading sequence ---- */
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const handleEnter = useCallback((name: string) => {
    setPlayerName(name);
    setScreen('lobby');
  }, []);

  const handleStartGame = useCallback(async () => {
    setScreen('loading');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < LOADING_MESSAGES.length) setLoadingMsg(LOADING_MESSAGES[i]);
    }, 500);

    // load star map data in parallel with loading animation
    const [starMapData] = await Promise.all([
      fetchStarMap(),
      new Promise((r) => setTimeout(r, 1600)),
    ]);

    clearInterval(iv);
    store.dispatch(setPlanets(starMapData.planets));
    store.dispatch(setConnections(starMapData.connections));
    setScreen('game');
  }, []);

  const handleEndGame = useCallback(() => {
    setSettlementOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    setScreen('login');
    setPlayerName('');
  }, []);

  /* ---- keyboard shortcuts for demos ---- */
  useEffect(() => {
    if (screen !== 'game') return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // DevPanel toggle: Ctrl+` or Alt+D
      if ((e.ctrlKey || e.altKey) && (e.key === '`' || e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setDevOpen((v) => !v);
        return;
      }
      switch (e.key) {
        case 't': case 'T': pushToastSequence(); break;
        case 'e': case 'E': setEncounterOpen((v) => !v); break;
        case 'm': case 'M': setTradeOpen((v) => !v); break;
        case 's': case 'S': setSettlementOpen((v) => !v); break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* ---- Login ---- */}
        {screen === 'login' && <LoginScreen onEnter={handleEnter} />}

        {/* ---- Lobby ---- */}
        {screen === 'lobby' && (
          <LobbyScreen playerName={playerName} onStartGame={handleStartGame} onLogout={handleLogout} />
        )}

        {/* ---- Loading transition (NX-03) ---- */}
        {screen === 'loading' && (
          <Box
            sx={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              bgcolor: colors.bg.deep,
            }}
          >
            <LoadingSpinner text={loadingMsg} size={64} />
          </Box>
        )}

        {/* ---- Game ---- */}
        {screen === 'game' && (
          <>
            <GameScene
              canvasRef={canvasRef}
              topHUD={{ ...MOCK_TOP_HUD, onEndGame: handleEndGame }}
              rightCargo={{ cargoUsed: 20, cargoCapacity: 80, slots: MOCK_CARGO_SLOTS, onSlotClick: () => {} }}
              bottomInfo={{
                monopolyItems: MOCK_MONOPOLY,
                currentStationName: '阿尔法空间站',
                currentStationSecurity: 'B',
              }}
            />

            {/* === MODALS: rendered at App root to avoid GameScene overflow containment === */}

            {/* TradeModal */}
            <TradeModal
              open={tradeOpen}
              stationName="阿尔法空间站"
              stationGoods={MOCK_STATION_GOODS}
              cargoItems={MOCK_CARGO}
              isLoading={false}
              onSelectGoods={(g) => setMiniTrade(g)}
              onClose={() => { setTradeOpen(false); setMiniTrade(null); }}
            />

            {/* MiniTradePanel */}
            {miniTrade && (
              <Box sx={{ position: 'fixed', inset: 0, zIndex: 25, bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMiniTrade(null)}>
                <MiniTradePanel
                  goodsId={miniTrade.goodsId}
                  goodsName={miniTrade.goodsName}
                  currentPrice={miniTrade.currentPrice}
                  previousPrice={miniTrade.previousPrice}
                  stock={miniTrade.stock}
                  isContraband={miniTrade.isContraband}
                  cargoQuantity={MOCK_CARGO.find((c) => c.goodsId === miniTrade.goodsId)?.quantity ?? 0}
                  maxBuy={Math.floor(12450 / miniTrade.currentPrice)}
                  maxSell={MOCK_CARGO.find((c) => c.goodsId === miniTrade.goodsId)?.quantity ?? 0}
                  adjacentPrices={[
                    { stationName: '贝塔港', price: miniTrade.currentPrice + 45 },
                    { stationName: '伽马站', price: miniTrade.currentPrice - 30 },
                    { stationName: '德尔塔', price: miniTrade.currentPrice + 12 },
                  ]}
                  onExecute={() => { setMiniTrade(null); pushWorldToast(`${miniTrade.goodsName} 交易完成`, 'market_shock'); }}
                  onClose={() => setMiniTrade(null)}
                />
              </Box>
            )}

            {/* EncounterModal */}
            <EncounterModal
              open={encounterOpen}
              title={MOCK_ENCOUNTER.title}
              description={MOCK_ENCOUNTER.description}
              choices={MOCK_ENCOUNTER.choices}
              result={encounterResult}
              onChoose={(id) => {
                const ok = id === 2;
                setEncounterResult({ success: ok, message: ok ? '你获得了 500 CR 奖金！' : '违禁品被没收，可疑度 +50' });
              }}
              onConfirmResult={() => { setEncounterResult(null); setEncounterOpen(false); }}
            />

            {/* SettlementScreen */}
            {settlementOpen && (
              <SettlementScreen
                data={MOCK_SETTLEMENT}
                onReplay={() => { setSettlementOpen(false); setScreen('loading'); handleStartGame(); }}
                onHome={() => { setSettlementOpen(false); setScreen('lobby'); }}
              />
            )}

            {/* ---- Debug toolbar (NX-02): hide when any modal is active ---- */}
            {!tradeOpen && !encounterOpen && !settlementOpen && !miniTrade && (
            <Box
                sx={{
                  position: 'fixed',
                  bottom: 'calc(var(--hud-bottom-height) + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 35,
                  display: 'flex',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: 'rgba(10,15,30,0.92)',
                  border: `1px solid ${colors.border}`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {([
                  ['M', '交易', () => setTradeOpen((v) => !v)],
                  ['E', '遭遇', () => setEncounterOpen((v) => !v)],
                  ['S', '结算', () => setSettlementOpen(true)],
                  ['T', '事件', pushToastSequence],
                ] as const).map(([key, label, fn]) => (
                  <Button
                    key={key}
                    size="small"
                    variant="outlined"
                    onClick={fn as () => void}
                    sx={{
                      fontSize: '0.6rem',
                      fontFamily: 'var(--font-mono)',
                      py: 0.25,
                      px: 1,
                      minWidth: 0,
                      borderColor: colors.border,
                      color: colors.muted,
                      '&:hover': { color: colors.primary, borderColor: colors.primary },
                    }}
                  >
                    [{key}] {label}
                  </Button>
                ))}
              </Box>
            )}
          </>
        )}

        {/* ---- DevPanel (NX-10) ---- */}
        {screen === 'game' && <DevPanel open={devOpen} onClose={() => setDevOpen(false)} />}
      </ThemeProvider>
    </Provider>
  );
}

/* ---- WorldEventToast sequence demo (NX-04) ---- */
function pushToastSequence() {
  const events: Array<[string, 'route_blocked' | 'market_shock' | 'route_opened' | 'wanted_change' | 'monopoly_progress']> = [
    ['海盗封锁了阿尔法-贝塔航线', 'route_blocked'],
    ['全星系晶体价格大幅波动', 'market_shock'],
    ['新的暗物质贸易航线已解锁', 'route_opened'],
    ['你的可疑度上升至 Lv.2', 'wanted_change'],
    ['暗物质核心持有率达到 91%，接近垄断！', 'monopoly_progress'],
  ];
  events.forEach(([msg, type], i) => {
    setTimeout(() => pushWorldToast(msg, type), i * 600);
  });
}
