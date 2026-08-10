// One-off check that the Jolpica API still matches what championship-calc-data.js
// assumes. Not an automated test - run manually if the calculator ever looks wrong.
const API_BASE = 'https://api.jolpi.ca/ergast/f1';
const CURRENT_YEAR = 2026;

async function main() {
    const standingsRes = await fetch(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
    const standingsData = await standingsRes.json();
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    console.log('Completed round:', list.round, '- top driver:', list.DriverStandings[0].Driver.code);

    const scheduleRes = await fetch(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const scheduleData = await scheduleRes.json();
    const schedule = scheduleData.MRData.RaceTable.Races;
    console.log('Schedule length:', schedule.length, '(expect 23 for the full 2026 season)');
    console.log('Sprint rounds on the calendar:', schedule.filter(r => r.Sprint).map(r => r.round).join(','));

    const sprintRes = await fetch(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);
    const sprintData = await sprintRes.json();
    console.log('Sprint results so far:', sprintData.MRData.RaceTable.Races.length, 'rounds');

    console.log('\nIf all of the above look sane, championship-calc-data.js\'s assumptions still hold.');
}

main().catch(e => { console.error('API ASSUMPTION CHECK FAILED:', e); process.exit(1); });
