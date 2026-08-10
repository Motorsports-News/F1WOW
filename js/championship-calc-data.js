// Fetches and shapes live 2026 season data for the championship calculator.
// Depends on globals from script.js: cachedJson, API_BASE, CURRENT_YEAR, fetchMergedSeasonResults.
// Browser-only - not required() by the Node engine tests (see Task 5 notes in the plan).

async function loadChampionshipCalcData(topN) {
    topN = topN || 12;

    // None of these four depend on each other's response, only on all of them
    // together for the mapping below - fetching in parallel instead of one after
    // another cuts load time to roughly the slowest single call instead of the
    // sum of all four.
    const [standingsData, scheduleData, mergedResults, sprintData] = await Promise.all([
        cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`),
        cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`),
        fetchMergedSeasonResults(),
        cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`)
    ]);

    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.DriverStandings.slice(0, topN);
    const completedRound = parseInt(list.round);
    const schedule = scheduleData.MRData.RaceTable.Races;
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
        const sprintHistory = sprintResults
            .map(r => {
                const res = r.SprintResults.find(x => x.Driver.driverId === id);
                return res ? parseFloat(res.points) : null;
            })
            .filter(v => v !== null);
        return {
            id,
            code: s.Driver.code,
            team: s.Constructors?.[0]?.name || 'Unknown',
            currentPoints: parseFloat(s.points),
            pace: ChampionshipCalc.computePaceStats(gpHistory, sprintHistory), // display only (see Task 3 amendment)
            history: { gpHistory, sprintHistory } // used by the simulation engine
        };
    });

    return { drivers, remainingRaces, completedRound };
}

async function loadConstructorCalcData(topN) {
    topN = topN || 8;

    // Same independent-fetches-in-parallel reasoning as loadChampionshipCalcData.
    const [standingsData, scheduleData, mergedResults, sprintData] = await Promise.all([
        cachedJson(`${API_BASE}/${CURRENT_YEAR}/constructorstandings.json`),
        cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`),
        fetchMergedSeasonResults(),
        cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`)
    ]);

    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.ConstructorStandings.slice(0, topN);
    const schedule = scheduleData.MRData.RaceTable.Races;
    const completedRound = parseInt(list.round);
    const remainingRaces = schedule
        .filter(r => parseInt(r.round) > completedRound)
        .map(r => ({ round: parseInt(r.round), name: r.raceName, date: r.date, isSprint: !!r.Sprint }));

    const sprintResults = sprintData.MRData.RaceTable.Races;

    const constructors = standings.map(s => {
        const id = s.Constructor.constructorId;
        // Combine both cars' points per round - this is the one real difference from
        // the drivers' engine: a team's pace/variance reflects BOTH drivers together.
        const gpHistory = mergedResults.map(r => {
            const teamResults = r.Results.filter(x => x.Constructor.constructorId === id);
            return teamResults.length ? teamResults.reduce((sum, x) => sum + parseFloat(x.points), 0) : null;
        }).filter(v => v !== null);
        // Same null-exclusion pattern as gpHistory (and as the Task 5 fix for drivers'
        // sprintHistory) - a round with no entries for this team is excluded rather than
        // defaulted to 0, so a future mid-season team change can't inject a spurious 0.
        const sprintHistory = sprintResults.map(r => {
            const teamResults = r.SprintResults.filter(x => x.Constructor.constructorId === id);
            return teamResults.length ? teamResults.reduce((sum, x) => sum + parseFloat(x.points), 0) : null;
        }).filter(v => v !== null);
        return {
            id,
            code: s.Constructor.name,
            team: s.Constructor.name,
            currentPoints: parseFloat(s.points),
            pace: ChampionshipCalc.computePaceStats(gpHistory, sprintHistory), // display only (see Task 3 amendment)
            history: { gpHistory, sprintHistory } // used by the simulation engine
        };
    });

    return { drivers: constructors, remainingRaces, completedRound };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadChampionshipCalcData, loadConstructorCalcData };
}
