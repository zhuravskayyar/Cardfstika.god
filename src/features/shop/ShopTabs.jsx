import './shop.css';

export default function ShopTabs({ tabs, activeId, onSelect }) {
  return (
    <div className="shop-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeId === tab.id}
          className={`shop-tab${activeId === tab.id ? ' shop-tab--active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
