export function pickActiveDeneme(denemes) {
  if (!denemes.length) return null;
  return denemes.find((d) => d.questions.some((q) => !q.userAnswer)) ?? denemes[denemes.length - 1];
}
