import { useGame } from '../../store/GameContext.jsx';
import RowButton from '../ui/RowButton.jsx';
import '../../styles/components/ListMenu.css';

import taskIcon from '../../assets/buttonpazzle/task.png';
import diamondsIcon from '../../assets/buttonpazzle/almaz.png';
import equipmentIcon from '../../assets/buttonpazzle/items.png';
import collectionsIcon from '../../assets/buttonpazzle/colections.png';
import bestIcon from '../../assets/buttonpazzle/liederboard.png';
import shopIcon from '../../assets/buttonpazzle/shop.png';

const MENU_ICONS = {
  tasks: taskIcon,
  diamonds: diamondsIcon,
  equipment: equipmentIcon,
  collections: collectionsIcon,
  best: bestIcon,
  shop: shopIcon,
};

export default function ListMenu() {
  const { state, dispatch } = useGame();

  function handleClick(item) {
    if (item.id === 'tasks') {
      dispatch({ type: 'COMPLETE_TASK' });
    }
    if (item.id === 'collections') {
      dispatch({ type: 'OPEN_COLLECTIONS' });
      return;
    }
    dispatch({ type: 'SET_TAB', payload: item.id });
  }

  return (
    <section className="list-menu" aria-label="Додаткові розділи">
      {state.listItems.map((item) => (
        <RowButton
          key={item.id}
          image={MENU_ICONS[item.id]}
          icon={item.icon}
          iconColor={item.iconColor}
          title={item.title}
          badge={item.id === 'tasks' && state.tasks.hasNew ? state.tasks.count : null}
          hasDot={item.id === 'tasks' ? state.tasks.hasNew : item.hasDot}
          onClick={() => handleClick(item)}
        />
      ))}
    </section>
  );
}
