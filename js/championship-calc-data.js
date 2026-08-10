// Fetches and shapes live 2026 season data for the championship calculator.
// Depends on globals from script.js: cachedJson, API_BASE, CURRENT_YEAR, fetchMergedSeasonResults.
// Browser-only - not required() by the Node engine tests (see Task 5 notes in the plan).

async function loadChampionshipCalcData(topN) {
    topN = topN || 12;

    const standingsData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.DriverStandings.slice(0, topN);
    const completedRound = parseInt(list.round);

    const scheduleData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const schedule = scheduleData.MRData.RaceTable.Races;

    const mergedResults = await fetchMergedSeasonResults();

    const sprintData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);
    const sprintResults = sprintData.MRData.RaceTable.Races;

    const remainingRaces = schedule
        .filter(r => parseInt(r.round) > completedRound)
        .map(r => ({ round: parseInt(r.round), name: r.raceName, date: r.date, isSprint: !!r.Sprint }));

    const drivers = standings.map(s => {
        const id = s.Driver.driverId;
        const gpHistory = mergedResults
            .map(r => {
                const res = r.Results.find(x => x.Driver.driverId === id);
                return res ? parseFloat(res.points) : null;
            })
            .filter(v => v !== null);
        const sprintHistory = sprintResults.map(r => {
            const res = r.SprintResults.find(x => x.Driver.driverId === id);
            return res ? parseFloat(res.points) : 0;
        });
        return {
            id,
            code: s.Driver.code,
            team: s.Constructors[0].name,
            currentPoints: parseFloat(s.points),
            pace: ChampionshipCalc.computePaceStats(gpHistory, sprintHistory), // display only (see Task 3 amendment)
            history: { gpHistory, sprintHistory } // used by the simulation engine
        };
    });

    return { drivers, remainingRaces, completedRound };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadChampionshipCalcData };
}
