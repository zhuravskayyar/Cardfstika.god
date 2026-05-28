import { Icon } from './Icons.jsx';
import '../../styles/components/Tile.css';

export default function Tile({ icon, iconColor, image, title, stat, gradient = 'default', onClick }) {
  return (
    <button
      className={`tile tile--${gradient}`}
      onClick={onClick}
      aria-label={title}
    >
      {image ? (
        <div className="tile__overlay">
          <img className="tile__img" src={image} alt={title} draggable={false} />
          <div className="tile__text">
            <span className="tile__title">{title}</span>
            {stat && <span className="tile__stat">{stat}</span>}
          </div>
        </div>
      ) : (
        <div className="tile__overlay">
          <div className="tile__icon">
            <Icon name={icon} size="38px" color={iconColor} />
          </div>
          <div className="tile__text">
            <span className="tile__title">{title}</span>
            {stat && <span className="tile__stat">{stat}</span>}
          </div>
        </div>
      )}
    </button>
  );
}
