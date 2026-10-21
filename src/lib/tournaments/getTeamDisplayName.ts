export function getTeamDisplayName(playerNames: string[]): string {
  const names = playerNames.map((name) => name.trim()).filter(Boolean);

  if (names.length === 0) {
    return "Okänt lag";
  }

  if (names.length === 1) {
    return names[0];
  }

  return names
    .map((name) => {
      const firstThree = Array.from(name).slice(0, 3).join("");

      return (
        firstThree.charAt(0).toUpperCase() + firstThree.slice(1).toLowerCase()
      );
    })
    .join("");
}
