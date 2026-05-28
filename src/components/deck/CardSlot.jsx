import frameImg from '../../assets/cards/ramka/ramka.png';
import fireIcon from '../../assets/cards/pazzle/fire.png';
import waterIcon from '../../assets/cards/pazzle/watter.png';
import airIcon from '../../assets/cards/pazzle/air.png';
import earthIcon from '../../assets/cards/pazzle/earth.png';
import '../../styles/components/CardSlot.css';

const ELEMENT_ICONS = {
  fire: fireIcon,
  water: waterIcon,
  air: airIcon,
  earth: earthIcon,
};

export { ELEMENT_ICONS };

export default function CardSlot({
  power,
  element = 'fire',
  empty = false,
  name,
  origin,
  art,
  selected = false,
  onClick,
  minimal = false,
}) {
  const elementIcon = ELEMENT_ICONS[element] ?? fireIcon;
  const Root = onClick ? 'button' : 'div';
  const powerText = power == null ? '' : String(power);
  const powerDigits = Math.min(powerText.length, 5);

  if (minimal) {
    return (
      <div className={`card-slot card-slot--minimal card-slot--${element}`} aria-label={name ? `${name}, ${origin ?? ''}` : undefined}>
        {art ? <img className="card-slot__art-img" src={art} alt="" draggable={false} /> : null}
      </div>
    );
  }

  return (
    <Root
      className={`card-slot card-slot--${element}${empty ? ' card-slot--empty' : ''}${selected ? ' card-slot--selected' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      aria-label={name ? `${name}, ${origin ?? ''}` : undefined}
    >
      <div className="card-slot__art">
        {art && <img className="card-slot__art-img" src={art} alt="" draggable={false} />}
      </div>

      <img className="card-slot__frame" src={frameImg} alt="" draggable={false} />

      {!empty && (
        <>
          <div className="card-slot__power">
            <span data-digits={powerDigits}>{powerText}</span>
          </div>

          <div className="card-slot__element">
            <img className="card-slot__element-icon" src={elementIcon} alt="" draggable={false} />
          </div>
        </>
      )}
    </Root>
  );
}
