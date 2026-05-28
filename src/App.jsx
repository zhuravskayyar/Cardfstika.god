import { useGame } from './store/GameContext.jsx';
import GameScreen from './components/layout/GameScreen.jsx';
import TopBar from './components/layout/TopBar.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import GridMenu from './components/menu/GridMenu.jsx';
import ListMenu from './components/menu/ListMenu.jsx';
import DeckScreen from './components/deck/DeckScreen.jsx';
import CollectionsScreen from './components/collections/CollectionsScreen.jsx';
import PlaceholderScreen from './components/placeholder/PlaceholderScreen.jsx';
import AuthGate from './features/auth/AuthGate.jsx';
import ShopScreen from './features/shop/ShopScreen.jsx';
import DuelScreen from './features/duel/DuelScreen.jsx';
import ProfileScreen from './features/profile/ProfileScreen.jsx';
import SettingsScreen from './features/settings/SettingsScreen.jsx';
import { PLACEHOLDER_TABS } from './navigation/tabs.js';

function HomeScreen() {
  return (
    <div className="home-screen">
      <GridMenu />
      <ListMenu />
    </div>
  );
}

export default function App() {
  const { state } = useGame();

  const screens = {
    home: <HomeScreen />,
    profile: <ProfileScreen />,
    deck: <DeckScreen />,
    collections: <CollectionsScreen />,
    collectionDetail: <CollectionsScreen />,
    collectionCardDetail: <CollectionsScreen />,
    shop: <ShopScreen />,
    duel: <DuelScreen />,
    settings: <SettingsScreen />,
    ...Object.fromEntries(
      Object.entries(PLACEHOLDER_TABS).map(([id, title]) => [
        id,
        <PlaceholderScreen title={title} />,
      ]),
    ),
  };

  if (!state.isAuthenticated) {
    return <AuthGate />;
  }

  if (state.activeTab === 'shop') {
    return <ShopScreen />;
  }

  return (
    <GameScreen>
      <TopBar />
      <div className={`game-screen__content${state.activeTab === 'home' ? ' game-screen__content--home' : ''}`}>
        {screens[state.activeTab] ?? <HomeScreen />}
      </div>
      <BottomNav />
    </GameScreen>
  );
}
