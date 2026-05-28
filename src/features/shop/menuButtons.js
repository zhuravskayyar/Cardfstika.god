// Кнопки меню магазину (нижній блок)
import shopIcon from '../../assets/buttonpazzle/shop.png';
import deckIcon from '../../assets/main menu/deck.png';
import taskIcon from '../../assets/buttonpazzle/task.png';
import goldIcon from '../../assets/icons/gold.png';

export const SHOP_MENU_BUTTONS = [
  {
    key: 'back',
    image: shopIcon,
    title: 'Назад в магазин',
    action: 'back',
  },
  {
    key: 'deck',
    image: deckIcon,
    title: 'Боевая колода',
    action: 'deck',
  },
  {
    key: 'tasks',
    image: taskIcon,
    title: 'Задания',
    action: 'tasks',
    hasDot: true,
  },
  {
    key: 'gold',
    image: goldIcon,
    title: 'Купить золото',
    action: 'gold',
  },
];
