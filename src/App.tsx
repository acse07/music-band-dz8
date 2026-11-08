import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError, request, setAccessToken } from './api';
import type { LoginResponse, Profile, Specialization, User } from './types';

type Page = 'home' | 'login' | 'register' | 'profile';

const emptyProfile: Profile = {
  first_name: '', specialization: 'other', specialization_display: '', bio: '', fee: '0.00',
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  useEffect(() => {
    async function checkSession() {
      try {
        const data = await request<User>('/profile/');
        setUser(data);
        setProfile(data.profile);
      } catch (err) {
        if (!(err instanceof ApiError && (err.status === 401 || err.status === 403))) {
          setError(getError(err));
        }
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  function getError(err: unknown) {
    return err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте ещё раз.';
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
    setEditing(false);
  }

  function handleSessionError(err: unknown) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      setAccessToken(null);
      setUser(null);
      setPage('login');
      setEditing(false);
      setError('Сессия завершилась. Войдите снова.');
    } else {
      setError(getError(err));
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (page === 'register' && password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setLoading(true);
    try {
      const body = { username: username.trim(), password };

      if (page === 'register') {
        const data = await request<LoginResponse>('/register/', 'POST', body);
        setAccessToken(data.access);
        setUser(data.user);
        setProfile(data.user.profile);
        setPage('profile');
        setPassword('');
        setConfirmPassword('');
        setMessage('Аккаунт создан. Добро пожаловать в группу!');
      } else {
        const data = await request<LoginResponse>('/login/', 'POST', body);
        setAccessToken(data.access);
        setUser(data.user);
        setProfile(data.user.profile);
        setPage('profile');
        setPassword('');
        setMessage('Вы вошли в систему. Добро пожаловать!');
      }
    } catch (err) {
      if (page === 'login' && err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError('Не удалось войти. Проверьте логин и пароль. Если они верны, разрешите cookie для сервера API.');
      } else {
        setError(getError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  async function openProfile() {
    navigate('profile');
    setLoading(true);
    try {
      const data = await request<User>('/profile/');
      setUser(data);
      setProfile(data.profile);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  }

  async function startEditing() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const choices = await request<Specialization[]>('/specializations/');
      setSpecializations(choices);
      setProfile(user!.profile);
      setEditing(true);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await request<User>('/profile/', 'PATCH', {
        first_name: profile.first_name.trim(),
        specialization: profile.specialization,
        bio: profile.bio.trim(),
        fee: profile.fee,
      });
      setUser(data);
      setProfile(data.profile);
      setEditing(false);
      setMessage('Профиль сохранён.');
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await request('/logout/', 'POST');
      setMessage('Вы вышли из системы.');
    } catch (err) {
      setError(getError(err));
    } finally {
      setAccessToken(null);
      setUser(null);
      setProfile(emptyProfile);
      setPage('home');
      setEditing(false);
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <div className="loading" role="status"><span className="spinner" /> Загрузка...</div>}

      <header>
        <div className="container header-content">
          <button className="logo" onClick={() => navigate('home')} disabled={loading}>Тихий шум<span>музыкальная группа</span></button>
          <nav aria-label="Основная навигация">
            <button className={page === 'home' ? 'nav-active' : ''} onClick={() => navigate('home')} disabled={loading}>Главная</button>
            {user ? <>
              <button className={page === 'profile' ? 'nav-active' : ''} onClick={openProfile} disabled={loading}>Мой профиль</button>
              <button onClick={logout} disabled={loading}>Выйти</button>
            </> : <>
              <button className={page === 'login' ? 'nav-active' : ''} onClick={() => navigate('login')} disabled={loading}>Войти</button>
              <button className="button small" onClick={() => navigate('register')} disabled={loading}>Регистрация</button>
            </>}
          </nav>
        </div>
      </header>

      <main className="container" aria-busy={loading}>
        {error && <div className="notice error" role="alert">{error}</div>}
        {message && <div className="notice success" role="status">{message}</div>}

        {page === 'home' && <>
          <section className="hero">
            <div>
              <p className="eyebrow">ИНДИ-РОК · ЖИВОЙ ЗВУК</p>
              <h1>Вместе звучим<br />громче.</h1>
              <p className="intro">Мы — «Тихий шум». Играем гитарную музыку, собираемся на репетициях и ищем своё звучание.</p>
              <button className="button" disabled={loading} onClick={() => user ? openProfile() : navigate('register')}>{user ? 'Открыть профиль' : 'Стать частью группы'} <span aria-hidden="true">↗</span></button>
              <p className="hero-note">Музыка начинается с людей.</p>
            </div>
            <div className="record-cover" aria-hidden="true"><div className="record"><div className="record-label">ТИХИЙ<br />ШУМ<span>33 RPM · SIDE A</span></div></div><span className="cover-note">НАША ВОЛНА / 01</span></div>
          </section>

          <section className="about">
            <p className="eyebrow">О ГРУППЕ</p>
            <h2>Разные инструменты.<br />Один ритм.</h2>
            <p>Любим тёплый звук гитар, честные тексты и вечера в репетиционной. Здесь каждый музыкант может рассказать о себе, выбрать инструмент и заполнить свой профиль.</p>
            <div className="tags"><span>Гитара</span><span>Вокал</span><span>Бас</span><span>Ударные</span><span>Клавиши</span></div>
          </section>
        </>}

        {(page === 'login' || page === 'register') && <section className="auth card">
          <p className="eyebrow">ТИХИЙ ШУМ / ЛИЧНЫЙ КАБИНЕТ</p>
          <h1>{page === 'register' ? 'Присоединяйся' : 'С возвращением'}</h1>
          <p className="muted">{page === 'register' ? 'Создай аккаунт и расскажи о себе как о музыканте.' : 'Войди, чтобы открыть свой профиль музыканта.'}</p>
          <form onSubmit={handleAuth}>
            <fieldset disabled={loading}>
              <label htmlFor="username">Логин</label>
              <input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" maxLength={150} required placeholder="Например, guitar_player" />
              {page === 'register' && <p className="hint">Буквы, цифры и символы @ . + - _</p>}
              <label htmlFor="password">Пароль</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={page === 'register' ? 'new-password' : 'current-password'} minLength={page === 'register' ? 6 : undefined} required placeholder={page === 'register' ? 'Не менее 6 символов' : 'Твой пароль'} />
              {page === 'register' && <>
                <label htmlFor="confirm-password">Повтори пароль</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={6} required placeholder="Ещё раз, чтобы не ошибиться" />
              </>}
              <button className="button full" type="submit">{page === 'register' ? 'Зарегистрироваться' : 'Войти'}</button>
            </fieldset>
          </form>
          <p className="form-bottom">{page === 'register' ? 'Уже есть аккаунт? ' : 'Ещё нет аккаунта? '}<button className="text-button" disabled={loading} onClick={() => navigate(page === 'register' ? 'login' : 'register')}>{page === 'register' ? 'Войти' : 'Зарегистрироваться'}</button></p>
        </section>}

        {page === 'profile' && user && <section className="profile-layout">
          <aside className="profile-summary card">
            <div className="avatar" aria-hidden="true">{(user.profile.first_name || user.username).slice(0, 1).toUpperCase()}</div>
            <h1>{user.profile.first_name || user.username}</h1>
            <p className="muted">@{user.username}</p>
            <span className="tag">{user.profile.specialization_display || 'Музыкант'}</span>
            <p className="hint">Твой личный кабинет<br />в группе «Тихий шум».</p>
          </aside>
          <div className="profile-details card">
            <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>
            <h2>{editing ? 'Редактировать профиль' : 'Мой профиль'}</h2>
            {editing ? <form onSubmit={saveProfile}>
              <fieldset disabled={loading}>
                <label htmlFor="first-name">Имя</label>
                <input id="first-name" value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} maxLength={100} autoComplete="given-name" placeholder="Как тебя зовут?" />
                <label htmlFor="specialization">Инструмент / специализация</label>
                <select id="specialization" value={profile.specialization} onChange={e => setProfile({ ...profile, specialization: e.target.value })}>
                  <option value="" disabled>Выбери специализацию</option>
                  {specializations.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <label htmlFor="bio">О себе</label>
                <textarea id="bio" rows={5} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Какую музыку любишь и на чём играешь?" />
                <label htmlFor="fee">Гонорар</label>
                <input id="fee" type="number" min="0" max="99999999.99" step="0.01" value={profile.fee} onChange={e => setProfile({ ...profile, fee: e.target.value })} required />
                <div className="form-actions"><button className="button" type="submit">Сохранить</button><button className="button secondary" type="button" onClick={() => { setEditing(false); setError(''); }}>Отмена</button></div>
              </fieldset>
            </form> : <>
              <dl>
                <div><dt>Логин</dt><dd>{user.username}</dd></div>
                <div><dt>Имя</dt><dd>{user.profile.first_name || 'Пока не указано'}</dd></div>
                <div><dt>Специализация</dt><dd>{user.profile.specialization_display || 'Пока не указана'}</dd></div>
                <div><dt>О себе</dt><dd className="bio">{user.profile.bio || 'Расскажи немного о себе — здесь появится твоя история.'}</dd></div>
                <div><dt>Гонорар</dt><dd>{user.profile.fee || '0.00'}</dd></div>
              </dl>
              <button className="button" onClick={startEditing} disabled={loading}>Редактировать профиль</button>
            </>}
          </div>
        </section>}
      </main>

      <footer className="container"><span>© {new Date().getFullYear()} Тихий шум</span><span>Учебный проект · ДЗ 8</span></footer>
    </>
  );
}


