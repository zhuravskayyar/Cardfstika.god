import { memo } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import homeIcon from '../../assets/botmenu/home.png';
import profileIcon from '../../assets/botmenu/profil.png';
import guildIcon from '../../assets/botmenu/guild.png';
import '../../styles/components/BottomNav.css';

const TABS = [
  { id: 'home', img: homeIcon, label: 'Головна' },
  { id: 'profile', img: profileIcon, label: 'Профіль' },
  { id: 'guild', img: guildIcon, label: 'Гільдія' },
];

function BottomNav() {
  const { state, dispatch } = useGame();

  return (
    <nav className="bottom-nav" aria-label="Навігація">
      {TABS.map((tab) => {
        const isActive = state.activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`bottom-nav__tab${isActive ? ' bottom-nav__tab--active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            aria-current={isActive ? 'page' : undefined}
          >
            <img src={tab.img} alt="" draggable={false} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default memo(BottomNav);
