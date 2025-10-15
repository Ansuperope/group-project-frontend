import React, { useState } from "react";

/**
 * Generic searchable dropdown select for foods (or any list).
 * Props:
 * - items: array of objects to search/select from
 * - cities: array of city objects (for city name search)
 * - getLabel: function(item) => string (display label)
 * - getId: function(item) => string|number (unique id)
 * - getCityId: function(item) => string|number|undefined (for city search)
 * - value: selected id
 * - onChange: function(id, item)
 * - placeholder: string
 */
const SearchableFoodSelect = ({
  items = [],
  cities = [],
  getLabel = item => item.name,
  getId = item => item.id,
  getCityId = item => item.city_id || item.cityId,
  value = '',
  onChange,
  placeholder = 'Type to search...'
}) => {
  const [filter, setFilter] = useState('');
  const [focused, setFocused] = useState(false);

  // Filtering logic: by name, id, or city name
  const filterItems = () => {
    const f = filter.trim().toLowerCase();
    if (!f) return items;
    const matchingCityIds = cities.filter(city => city.name.toLowerCase().includes(f)).map(city => city.id);
    const byNameOrId = items.filter(item => {
      const idMatch = String(getId(item)).includes(f);
      const nameMatch = (getLabel(item) || '').toLowerCase().includes(f);
      return idMatch || nameMatch;
    });
    const byCity = items.filter(item => {
      const cid = getCityId(item);
      return cid && matchingCityIds.includes(cid);
    });
    // Merge and dedupe
    return [...byNameOrId, ...byCity].filter((item, idx, arr) => arr.findIndex(i => getId(i) === getId(item)) === idx);
  };

  const filtered = filterItems();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={filter}
        onChange={e => {
          setFilter(e.target.value);
          if (onChange) onChange('', null);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        autoComplete="off"
      />
      {(focused || filter.length > 0) && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: 0,
          width: '100%',
          background: 'white',
          border: '1px solid #ccc',
          zIndex: 10,
          maxHeight: '180px',
          overflowY: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: '8px', color: '#888' }}>No results found</div>
          )}
          {filtered.map(item => (
            <div
              key={getId(item)}
              onMouseDown={() => {
                if (onChange) onChange(getId(item).toString(), item);
                setFilter(getLabel(item));
                setFocused(false);
              }}
              style={{
                padding: '8px',
                cursor: 'pointer',
                background: value === String(getId(item)) ? '#eee' : 'white'
              }}
            >
              {getLabel(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableFoodSelect;
