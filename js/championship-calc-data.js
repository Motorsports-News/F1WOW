// Fetches and shapes live 2026 season data for the championship calculator.
// Depends on globals from script.js: cachedJson, API_BASE, CURRENT_YEAR, fetchMergedSeasonResults.
// Browser-only - not required() by the Node engine tests (see Task 5 notes in the plan).

// onStandingsReady(quickDrivers), if given, fires as soon as the standings fetch
// resolves - typically well before the schedule/full-season-results/sprint fetches
// finish, since those need a second, dependent round of pagination. Lets the caller
// render something real immediately instead of one long blocking spinner for
// everything. quickDrivers only has id/code/team/currentPoints (enough for
// renderStandings) - no history/pace yet, those need the other fetches.
async function loadChampionshipCalcData(topN, onStandingsReady) {
    topN = topN || 12;

    // Start every fetch immediately so none of them wait on each other - but await
    // the standings one alone first so its callback can fire as early as possible.
    const standingsPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
    const scheduleDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const mergedResultsPromise = fetchMergedSeasonResults();
    const sprintDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);

    const standingsData = await standingsPromise;
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.DriverStandings.slice(0, topN);
    const completedRound = parseInt(list.round);

    if (onStandingsReady) {
        onStandingsReady(standings.map(s => ({
            id: s.Driver.driverId,
            code: s.Driver.code,
            team: s.Constructors?.[0]?.name || 'Unknown',
            currentPoints: parseFloat(s.points)
        })));
    }

    const [scheduleData, mergedResults, sprintData] = await Promise.all([
        scheduleDataPromise, mergedResultsPromise, sprintDataPromise
    ]);
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

// Same early-callback reasoning as loadChampionshipCalcData's onStandingsReady.
async function loadConstructorCalcData(topN, onStandingsReady) {
    topN = topN || 8;

    const standingsPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/constructorstandings.json`);
    const scheduleDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const mergedResultsPromise = fetchMergedSeasonResults();
    const sprintDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);

    const standingsData = await standingsPromise;
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.ConstructorStandings.slice(0, topN);
    const completedRound = parseInt(list.round);

    if (onStandingsReady) {
        onStandingsReady(standings.map(s => ({
            id: s.Constructor.constructorId,
            code: s.Constructor.name,
            team: s.Constructor.name,
            currentPoints: parseFloat(s.points)
        })));
    }

    const [scheduleData, mergedResults, sprintData] = await Promise.all([
        scheduleDataPromise, mergedResultsPromise, sprintDataPromise
    ]);
    const schedule = scheduleData.MRData.RaceTable.Races;
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
