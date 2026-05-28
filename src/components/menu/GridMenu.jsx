import { useGame } from '../../store/GameContext.jsx';
import Tile from '../ui/Tile.jsx';
import '../../styles/components/GridMenu.css';

import duelImg from '../../assets/main menu/duel.png';
import campainImg from '../../assets/main menu/campain.png';
import turnamentImg from '../../assets/main menu/turnament.png';
import arenaImg from '../../assets/main menu/arena.png';
import deckImg from '../../assets/main menu/deck.png';
import bossImg from '../../assets/main menu/boss.png';

const TILE_IMAGES = {
  duel: duelImg,
  campaign: campainImg,
  tournament: turnamentImg,
  arena: arenaImg,
  deck: deckImg,
  invasion: bossImg,
};

export default function GridMenu() {
  const { state, dispatch } = useGame();

  function handleTileClick(mode) {
    dispatch({ type: 'SET_TAB', payload: mode.id });
  }

  return (
    <section className="grid-menu" aria-label="Режими гри">
      {state.modes.map((mode) => (
        <Tile
          key={mode.id}
          image={TILE_IMAGES[mode.id]}
          icon={mode.icon}
          iconColor={mode.iconColor}
          title={mode.title}
          stat={mode.stat}
          gradient={mode.gradient}
          onClick={() => handleTileClick(mode)}
        />
      ))}
    </section>
  );
}
