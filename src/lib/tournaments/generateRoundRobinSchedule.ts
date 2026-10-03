type ScheduleMatch = {
  roundNumber: number;
  boardNumber: number;
  teamAId: number;
  teamBId: number;
};

export function generateRoundRobinSchedule(
  teamIds: number[],
  boardCount: number,
  doubleRoundRobin = false,
): ScheduleMatch[] {
  if (teamIds.length < 2) {
    return [];
  }

  const teams: Array<number | null> = [...teamIds];

  // Vid udda antal lag lägger vi till en "bye".
  if (teams.length % 2 !== 0) {
    teams.push(null);
  }

  const rounds: Array<Array<[number, number]>> = [];
  const totalRounds = teams.length - 1;
  const matchesPerRound = teams.length / 2;

  for (let round = 0; round < totalRounds; round += 1) {
    const roundMatches: Array<[number, number]> = [];

    for (let match = 0; match < matchesPerRound; match += 1) {
      const teamA = teams[match];
      const teamB = teams[teams.length - 1 - match];

      if (teamA !== null && teamB !== null) {
        roundMatches.push([teamA, teamB]);
      }
    }

    rounds.push(roundMatches);

    // Första laget ligger kvar.
    // Övriga lag roteras ett steg.
    const fixedTeam = teams[0];
    const rotatingTeams = teams.slice(1);

    rotatingTeams.unshift(rotatingTeams.pop()!);

    teams.splice(0, teams.length, fixedTeam, ...rotatingTeams);
  }

  if (doubleRoundRobin) {
    const returnRounds = rounds.map((roundMatches) =>
      roundMatches.map(([teamA, teamB]) => [teamB, teamA] as [number, number]),
    );

    rounds.push(...returnRounds);
  }

  const schedule: ScheduleMatch[] = [];
  let scheduleRound = 1;

  for (const roundMatches of rounds) {
    for (
      let startIndex = 0;
      startIndex < roundMatches.length;
      startIndex += boardCount
    ) {
      const matchesForBoards = roundMatches.slice(
        startIndex,
        startIndex + boardCount,
      );

      matchesForBoards.forEach(([teamAId, teamBId], index) => {
        schedule.push({
          roundNumber: scheduleRound,
          boardNumber: index + 1,
          teamAId,
          teamBId,
        });
      });

      scheduleRound += 1;
    }
  }

  return schedule;
}
