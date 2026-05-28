import './PlaceholderScreen.css';

export default function PlaceholderScreen({ title }) {
  return (
    <section className="placeholder-route" aria-label={title}>
      <div className="placeholder-route__title">{title}</div>
    </section>
  );
}
