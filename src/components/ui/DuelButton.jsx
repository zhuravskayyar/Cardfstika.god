import '../../styles/components/duel-button.css';

import blueButton from '../../assets/bt/bt_blue.png';
import greenButton from '../../assets/bt/bt_green.png';

const BUTTON_IMAGES = {
  primary: greenButton,
  secondary: blueButton,
};

export default function DuelButton({ title, onClick, variant = 'primary', disabled = false }) {
  return (
    <button
      className={`duel-button duel-button--${variant}`}
      onClick={onClick}
      style={{ '--duel-button-image': `url(${BUTTON_IMAGES[variant] ?? greenButton})` }}
      aria-label={title}
      disabled={disabled}
      type="button"
    >
      <span className="duel-button__label">{title}</span>
    </button>
  );
}
