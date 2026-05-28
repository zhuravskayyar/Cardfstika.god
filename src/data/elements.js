export const ELEMENTS = {
  air: { label: 'Повітря', style: 'блискавка, буря, вітер, небо' },
  water: { label: 'Вода', style: 'хвиля, ріка, море, лід' },
  earth: { label: 'Земля', style: 'камінь, ліс, гора, коріння' },
  fire: { label: 'Вогонь', style: 'полум’я, сонце, жар, вулкан' },
};

export function elementLabel(element) {
  return ELEMENTS[element]?.label ?? element;
}

