export function getPostSessionEncouragement({ distance = 0, duration = 0 }) {
  if (distance >= 5) {
    return 'Tu viens de parcourir une belle distance : savoure ce que ton corps a accompli.';
  }

  if (duration >= 30 * 60) {
    return 'Tu as pris du temps pour toi aujourd’hui. Cette régularité construit ta progression.';
  }

  return 'Tu as tenu ta séance jusqu’au bout : chaque effort compte dans ta progression.';
}
