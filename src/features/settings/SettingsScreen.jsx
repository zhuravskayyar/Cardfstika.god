import { useGame } from '../../store/GameContext.jsx';
import RowButton from '../../components/ui/RowButton.jsx';
import startAvatar from '../../assets/avatar/start.png';
import mailIcon from '../../assets/buttonpazzle/task.png';
import avatarIcon from '../../assets/botmenu/profil.png';
import equipmentIcon from '../../assets/buttonpazzle/items.png';
import recordsIcon from '../../assets/buttonpazzle/liederboard.png';
import shopIcon from '../../assets/buttonpazzle/shop.png';
import './SettingsScreen.css';

const SETTINGS_ROWS = [
  { id: 'profileForm', title: 'Ваша анкета', tab: 'profileForm', icon: mailIcon },
  { id: 'avatarSelect', title: 'Вибрати аватар', tab: 'avatarSelect', icon: avatarIcon },
  { id: 'accountLook', title: 'Вибрати облік', tab: 'accountLook', icon: equipmentIcon },
  { id: 'appearance', title: 'Оформлення', tab: 'appearance', icon: recordsIcon },
  { id: 'changePassword', title: 'Змінити пароль', tab: 'changePassword', icon: shopIcon },
];

function avatarUrl(profile) {
  if (profile?.avatar?.url) return profile.avatar.url;
  return startAvatar;
}

export default function SettingsScreen() {
  const { state, dispatch } = useGame();
  const player = state.player ?? {};
  const profile = state.profile ?? {};
  const name = profile.name || player.name || 'Гравець';
  const level = Number(player.level) || 1;
  const district = profile.district || 'Район не обрано';

  return (
    <section className="settings-screen" aria-label="Налаштування профілю">
      <div className="settings-title">Налаштування профілю</div>

      <section className="settings-profile">
        <div className="settings-profile__avatar">
          <img src={avatarUrl(profile)} alt="" draggable={false} />
        </div>
        <div className="settings-profile__info">
          <div className="settings-profile__name">{name}</div>
          <div className="settings-profile__level">{level} рівень</div>
          <div className="settings-profile__district">{district}</div>
        </div>
      </section>

      <div className="settings-actions">
        {SETTINGS_ROWS.map((row) => (
          <RowButton
            key={row.id}
            image={row.icon}
            title={row.title}
            onClick={() => dispatch({ type: 'SET_TAB', payload: row.tab })}
          />
        ))}

        {state.isAuthenticated ? (
          <RowButton
            image={shopIcon}
            title="Вихід"
            onClick={() => dispatch({ type: 'AUTH_LOGOUT' })}
          />
        ) : (
          <RowButton
            image={shopIcon}
            title="Логін"
            onClick={() => dispatch({ type: 'AUTH_LOGOUT' })}
          />
        )}
      </div>
    </section>
  );
}
