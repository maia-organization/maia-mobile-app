import { TextField } from './TextField';
import { isNumberInRange, isValidIsoDate } from '../utils/validation';

export function CycleFields({
  cycleLength,
  cycleStartDate,
  onCycleLengthChange,
  onCycleStartDateChange,
  onSubmitEditing,
  showValidation
}) {
  const cycleLengthValue = Number(cycleLength);

  return (
    <>
      <TextField
        error={
          showValidation && !isValidIsoDate(cycleStartDate)
            ? "Entre une date valide qui n'est pas dans le futur."
            : ''
        }
        helperText="Format : AAAA-MM-JJ"
        keyboardType="numbers-and-punctuation"
        label="Début des dernières règles"
        maxLength={10}
        onChangeText={onCycleStartDateChange}
        placeholder="AAAA-MM-JJ"
        value={cycleStartDate}
      />
      <TextField
        error={
          showValidation &&
          (!Number.isInteger(cycleLengthValue) || !isNumberInRange(cycleLengthValue, 21, 40))
            ? 'Saisis une durée comprise entre 21 et 40 jours.'
            : ''
        }
        helperText="Entre 21 et 40 jours"
        keyboardType="number-pad"
        label="Durée moyenne du cycle"
        maxLength={2}
        onChangeText={onCycleLengthChange}
        onSubmitEditing={onSubmitEditing}
        placeholder="28"
        returnKeyType="done"
        value={cycleLength}
      />
    </>
  );
}
