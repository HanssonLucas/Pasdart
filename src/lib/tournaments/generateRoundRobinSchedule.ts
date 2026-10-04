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

  const roundRobinRounds: Array<Array<[number, number]>> = [];
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

    roundRobinRounds.push(roundMatches);

    // Första laget ligger kvar.
    // Övriga lag roteras ett steg.
    const fixedTeam = teams[0];
    const rotatingTeams = teams.slice(1);

    rotatingTeams.unshift(rotatingTeams.pop()!);

    teams.splice(0, teams.length, fixedTeam, ...rotatingTeams);
  }

  const allMatches: Array<[number, number]> = roundRobinRounds.flat();

  if (doubleRoundRobin) {
    const returnMatches = roundRobinRounds
      .flat()
      .map(([teamA, teamB]) => [teamB, teamA] as [number, number]);

    allMatches.push(...returnMatches);
  }

  /*
   * Round-robin-rundorna ovan används bara för att skapa alla korrekta möten.
   *
   * Här bygger vi sedan det faktiska spelschemat oberoende av de ursprungliga
   * round-robin-rundorna. På så sätt kan vi fylla alla tillgängliga tavlor så
   * långt det går, utan att samma lag spelar två matcher i samma omgång.
   *
   * Exempel:
   * 6 lag + 2 tavlor = 15 matcher.
   * Det ger 8 spelomgångar: 2 + 2 + 2 + 2 + 2 + 2 + 2 + 1 matcher.
   */
  const remainingMatches = [...allMatches];
  const schedule: ScheduleMatch[] = [];

  let scheduleRound = 1;

  while (remainingMatches.length > 0) {
    const usedTeamIds = new Set<number>();
    const matchesForRound: Array<[number, number]> = [];

    for (
      let index = 0;
      index < remainingMatches.length && matchesForRound.length < boardCount;
    ) {
      const [teamAId, teamBId] = remainingMatches[index];

      const teamAlreadyPlaying =
        usedTeamIds.has(teamAId) || usedTeamIds.has(teamBId);

      if (teamAlreadyPlaying) {
        index += 1;
        continue;
      }

      matchesForRound.push([teamAId, teamBId]);
      usedTeamIds.add(teamAId);
      usedTeamIds.add(teamBId);
      remainingMatches.splice(index, 1);
    }

    matchesForRound.forEach(([teamAId, teamBId], index) => {
      schedule.push({
        roundNumber: scheduleRound,
        boardNumber: index + 1,
        teamAId,
        teamBId,
      });
    });

    scheduleRound += 1;
  }

  return schedule;
}
