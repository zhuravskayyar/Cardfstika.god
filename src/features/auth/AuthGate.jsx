import { useMemo, useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import { gameStateToAccount } from '../../store/account.js';
import { loginLocal, registerLocal } from '../../store/authAdapter.js';
import loginSprite from '../../assets/login/login.png';
import './AuthGate.css';

const ERROR_TEXT = {
  invalidName: 'Імʼя має містити тільки одну абетку та до 20 символів.',
  passwordTooShort: 'Пароль має містити щонайменше 4 символи.',
  passwordMismatch: 'Паролі не збігаються.',
  invalidCredentials: 'Невірне імʼя або пароль.',
  accountMissing: 'Спочатку створіть акаунт.',
  cryptoUnavailable: 'Браузер не підтримує безпечне хешування пароля.',
};

export default function AuthGate() {
  const { state, dispatch } = useGame();
  const [mode, setMode] = useState('gate');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasStoredAccount = Boolean(state.credentials?.username && state.credentials?.passwordHash);

  const title = useMemo(() => {
    if (mode === 'register') return 'Реєстрація';
    if (mode === 'login') return 'Вхід для гравців';
    return 'Повелителі стихій';
  }, [mode]);

  function resetForm(nextMode) {
    setMode(nextMode);
    setUsername('');
    setPassword('');
    setPasswordRepeat('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = mode === 'register'
        ? await registerLocal({ username, password, passwordRepeat })
        : await loginLocal(gameStateToAccount(state), { username, password });

      if (!result.ok) {
        setError(ERROR_TEXT[result.error] ?? 'Не вдалося виконати дію.');
        return;
      }

      dispatch({ type: 'AUTH_APPLY_ACCOUNT', payload: result.account });
    } catch (err) {
      setError(ERROR_TEXT[err?.message] ?? 'Не вдалося виконати дію.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-gate" aria-label="Вхід у гру">
      <section className={`auth-card ${mode === 'gate' ? 'auth-card--login' : 'auth-card--form'}`}>
        {mode === 'gate' ? (
          <div className="auth-login-sprite">
            <img className="auth-login-sprite__image" src={loginSprite} alt="" aria-hidden="true" />
            <button
              className="auth-login-sprite__button auth-login-sprite__button--start"
              type="button"
              onClick={() => resetForm('register')}
            >
              Почати гру
            </button>
            <button
              className="auth-login-sprite__button auth-login-sprite__button--login"
              type="button"
              onClick={() => resetForm('login')}
            >
              Вхід
            </button>
          </div>
        ) : (
          <>
            <div className="auth-card__title">{title}</div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-form__field">
                <span>Імʼя гравця</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  maxLength={20}
                  required
                />
              </label>

              <label className="auth-form__field">
                <span>Пароль</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  minLength={4}
                  required
                />
              </label>

              {mode === 'register' && (
                <label className="auth-form__field">
                  <span>Повтор пароля</span>
                  <input
                    type="password"
                    value={passwordRepeat}
                    onChange={(event) => setPasswordRepeat(event.target.value)}
                    autoComplete="new-password"
                    minLength={4}
                    required
                  />
                </label>
              )}

              {error && <div className="auth-form__error" role="alert">{error}</div>}

              <button className="auth-card__primary" type="submit" disabled={isSubmitting}>
                {mode === 'register' ? 'Створити акаунт' : 'Увійти'}
              </button>

              <button className="auth-form__link" type="button" onClick={() => resetForm(mode === 'register' ? 'login' : 'register')}>
                {mode === 'register' ? 'Вже є акаунт' : hasStoredAccount ? 'Створити новий акаунт' : 'Зареєструватися'}
              </button>

              <button className="auth-form__link" type="button" onClick={() => resetForm('gate')}>
                Назад
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
