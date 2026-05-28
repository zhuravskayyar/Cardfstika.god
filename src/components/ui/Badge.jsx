import '../../styles/components/Badge.css';

export default function Badge({ count }) {
  return (
    <span className="badge" aria-label={`${count} нових`}>
      {count}
    </span>
  );
}
