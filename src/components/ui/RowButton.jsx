import { Icon } from './Icons.jsx';
import Badge from './Badge.jsx';
import '../../styles/components/RowButton.css';

export default function RowButton({ icon, iconColor, image, title, badge, hasDot = false, onClick }) {
  return (
    <button className="row-button" onClick={onClick} aria-label={title}>
      <span className="row-button__icon-box">
        {image ? (
          <img className="row-button__icon-img" src={image} alt="" draggable={false} />
        ) : (
          <Icon name={icon} size="24px" color={iconColor} />
        )}
      </span>
      <span className="row-button__title">{title}</span>
      <div className="row-button__right">
        {badge != null && badge > 0 && <Badge count={badge} />}
        {hasDot && <span className="row-button__dot" aria-label="Є нові" />}
      </div>
    </button>
  );
}
