# Batch 2: rewrite/expand remaining thin legacy articles
import sys
sys.path.insert(0, '.')
from rewrite_helper import gen_article

# ============================================================
# 3. Verstappen criticizes 2026 cars - was ~500 words
# ============================================================
body = '''                <div class="article-intro">
                    <p><strong>SHANGHAI, March 15</strong> &mdash; Max Verstappen has launched a scathing attack on Formula 1's new 2026 technical regulations, describing the direction the sport has taken as "a joke" in the aftermath of the Chinese Grand Prix. It is one of the most pointed public criticisms of the rule change from any driver on the grid, and it has landed at a moment when Red Bull is still searching for its footing under the new formula.</p>
                </div>

                <div class="article-section">
                    <h2>"I'd Say the Same Thing If I Won"</h2>
                    <p>Speaking after the race, Verstappen did not hold back: <em>"It's a joke. I'd say the same thing if I won. If anyone actually finds this funny, then they don't understand what racing is all about."</em> The Dutchman's insistence that he would hold the same view regardless of result is a deliberate rebuttal to the suggestion that his frustration is simply sour grapes from a difficult weekend &mdash; he is framing this as a philosophical objection to where the sport is heading, not a complaint about a single result.</p>
                    <p>Sources close to the Red Bull camp suggest the comments were sparked by simulation and testing data on the new car concepts rather than any single on-track incident in Shanghai, pointing to a broader unease within the team about how the 2026 package has come together.</p>
                </div>

                <div class="article-section">
                    <h2>The 2026 Regulations: What Actually Changed</h2>
                    <p>The 2026 season represents the biggest technical revolution in modern Formula 1 history, and it is worth setting out exactly what has changed to understand what Verstappen is reacting to:</p>
                    <ul>
                        <li><strong>Active aerodynamics</strong> &mdash; moveable front and rear wings that adjust automatically to cut drag on the straights and add downforce through the corners</li>
                        <li><strong>New power units</strong> &mdash; roughly 50% electric power, up from around 25% previously, with a combined output of approximately 1000bhp</li>
                        <li><strong>No more MGU-H</strong> &mdash; the complex energy-recovery system harvesting heat from the turbocharger has been removed entirely</li>
                        <li><strong>Sustainable fuels</strong> &mdash; a switch to 100% sustainable fuel, cutting the sport's carbon footprint while aiming to preserve performance</li>
                        <li><strong>Reduced drag</strong> &mdash; cars redesigned to slipstream more easily, intended to produce closer, more overtaking-friendly racing</li>
                    </ul>
                </div>

                <div class="article-section">
                    <h2>Why Verstappen Is Concerned</h2>
                    <p>Verstappen has long been an outspoken advocate for what he sees as "pure" racing &mdash; a sport where the driver, not the car's technology, is the primary differentiator between success and failure. His remark that critics "don't understand what racing is all about" reads as a direct shot at the growing role of active aerodynamics and complex energy-management systems in determining lap time, rather than driver skill alone.</p>
                    <p>It is a familiar tension in Formula 1's history: every major regulation change, from ground-effect aerodynamics to hybrid power units, has drawn similar criticism from purists within the paddock. What makes Verstappen's intervention notable is the seniority of the voice making it &mdash; a reigning-calibre driver, rather than a fringe commentator, putting his name to the concern so bluntly and so early in the new regulatory cycle.</p>
                </div>

                <div class="article-section">
                    <h2>What Happens Next</h2>
                    <p>With the new rules locked in for the foreseeable future, Verstappen's comments are unlikely to trigger any immediate change &mdash; but they set the tone for how the 2026 package will be scrutinised race by race. If Red Bull's early-season pace continues to lag the frontrunners, expect these comments to be revisited often. Follow the championship fight as it develops on our <a href="championship.html">standings and progression graph</a>.</p>
                </div>
'''
gen_article(
    slug='verstappen-article.html',
    title="Verstappen Criticizes 2026 F1 Cars: 'It's a Joke'",
    desc="Max Verstappen launches a scathing attack on Formula 1's new 2026 technical regulations after the Chinese Grand Prix, calling the direction of the sport \"a joke\" in one of the most pointed driver criticisms of the new rules.",
    date='2026-03-15', display_date='March 15, 2026',
    category='news', label='News',
    h1="Verstappen: 2026 F1 Regulations Are \"A Joke\"",
    subtitle="Max Verstappen delivers one of the bluntest driver critiques of Formula 1's new technical era, insisting his frustration with the 2026 rules has nothing to do with results.",
    read_time=4,
    body_sections=body,
    related_items=[
        ('regulations-2026-article.html', 'Technical Analysis', 'F1 2026 vs 2025 Regulations: The Complete Guide'),
        ('china-gp.html', 'Race Report', 'Chinese Grand Prix 2026: Full Results &amp; Championship Standings'),
        ('antonelli-maiden-win.html', 'Race Report', 'Kimi Antonelli Takes Maiden F1 Win in China'),
        ('championship.html', 'Standings', '2026 Championship Standings &amp; Progression Graph'),
    ],
    share_text="Verstappen calls the 2026 F1 regulations \"a joke\"",
    event='2026 Formula 1 Season',
)
print('verstappen-article.html rewritten')

# ============================================================
# 4. Antonelli maiden win - was ~436 words
# ============================================================
body = '''                <div class="article-intro">
                    <p><strong>SHANGHAI, March 15</strong> &mdash; Kimi Antonelli has written his name into Formula 1 history, claiming his maiden Grand Prix victory at the Chinese Grand Prix at just 20 years old. The Mercedes rookie crossed the line 5.515 seconds clear of teammate George Russell, while Lewis Hamilton's third place secured his first podium since joining Ferrari.</p>
                </div>

                <div class="article-section">
                    <h2>Race Summary</h2>
                    <p>Starting from pole position, Antonelli became the first rookie since 2022 to win on debut, controlling the race from the front and managing tyre degradation expertly in tricky Shanghai conditions. It was a mature, controlled drive that belied his inexperience &mdash; there was no hint of a rookie under pressure, just a driver methodically building and protecting a lead over 56 laps.</p>
                    <p>The race saw intense battles throughout the field, but at the front the story was Mercedes' superiority: Russell completed a comfortable one-two for the team in second, while Hamilton's third for Ferrari marked a genuinely significant early milestone in his switch from Mercedes over the winter.</p>
                </div>

                <div class="article-section">
                    <h2>Key Moments</h2>
                    <p><strong>Lights out:</strong> Antonelli made a near-perfect start from pole, fending off an aggressive challenge from Russell into Turn 1 and immediately establishing a gap that the Mercedes duo would control for the rest of the afternoon.</p>
                    <p><strong>Pit-stop battles:</strong> Mercedes executed flawless stops for both cars under the first safety car period, protecting track position for Antonelli and Russell. Ferrari, meanwhile, used strategy to jump Hamilton ahead of teammate Charles Leclerc.</p>
                    <p><strong>Final stint:</strong> Antonelli managed his tyres expertly in the closing laps, extending his advantage over Russell while still finding enough pace to claim the bonus point for fastest lap &mdash; a statement of control from a driver in his second-ever Grand Prix start.</p>
                </div>

                <div class="article-section">
                    <h2>Final Race Results (Top 5)</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="Chinese Grand Prix 2026 top 5 finishers">
                            <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Gap</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Kimi Antonelli</td><td>Mercedes</td><td>Winner</td></tr>
                                <tr class="standings-row"><td>2</td><td>George Russell</td><td>Mercedes</td><td>+5.515s</td></tr>
                                <tr class="standings-row"><td>3</td><td>Lewis Hamilton</td><td>Ferrari</td><td>+25.267s</td></tr>
                                <tr class="standings-row"><td>4</td><td>Charles Leclerc</td><td>Ferrari</td><td>+28.894s</td></tr>
                                <tr class="standings-row"><td>5</td><td>Oliver Bearman</td><td>Haas F1 Team</td><td>+57.268s</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="article-section">
                    <h2>Why This Win Matters</h2>
                    <p>A maiden victory at 20 years old, delivered from pole position against a genuine teammate rival in George Russell, is the kind of result that reshapes expectations for an entire career. For Mercedes, it confirmed that the faith shown in fast-tracking Antonelli into a race seat was well placed &mdash; and it set up a fascinating intra-team dynamic that would define much of the team's season, with two drivers capable of winning on any given weekend.</p>
                    <p>Stat credit for the margin and lap data: <a href="https://instagram.com/f1guydan" target="_blank" rel="noopener">@f1guydan</a>, via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>.</p>
                </div>
'''
gen_article(
    slug='antonelli-maiden-win.html',
    title='Kimi Antonelli Wins Maiden Formula 1 Race at Chinese Grand Prix',
    desc="Kimi Antonelli, 20, claims his maiden Formula 1 victory at the Chinese Grand Prix from pole position, becoming the first rookie since 2022 to win on debut as Lewis Hamilton takes his first Ferrari podium.",
    date='2026-03-15', display_date='March 15, 2026',
    category='race', label='Race Report',
    h1="Antonelli's Maiden Win: Rookie Conquers Shanghai From Pole at Just 20",
    subtitle="Kimi Antonelli becomes the first rookie since 2022 to win on debut, controlling the Chinese Grand Prix from pole as Lewis Hamilton claims his first Ferrari podium.",
    read_time=5,
    body_sections=body,
    related_items=[
        ('china-gp.html', 'Race Report', 'Chinese Grand Prix 2026: Full Results &amp; Championship Standings'),
        ('australia-gp.html', 'Race Report', 'Australian GP 2026: Season Opener Results'),
        ('most-positions-gained-2026.html', 'Stat Attack', 'Comeback Kings of 2026: The Biggest Position Gains'),
        ('championship.html', 'Standings', '2026 Championship Standings &amp; Progression Graph'),
    ],
    share_text="Kimi Antonelli wins maiden F1 race at 20 years old",
    event='Chinese Grand Prix 2026', driver='Kimi Antonelli',
)
print('antonelli-maiden-win.html rewritten')

# ============================================================
# 5. Bahrain/Saudi cancellation - was ~345 words
# ============================================================
body = '''                <div class="article-intro">
                    <p><strong>MARCH 16</strong> &mdash; Formula 1 has officially cancelled the Bahrain and Saudi Arabian Grands Prix, originally scheduled for April 10&ndash;12 and April 17&ndash;19 respectively. The FIA cited "unforeseen regional circumstances" that made it impossible to safely proceed with either event, cutting the 2026 calendar from 24 races down to 22.</p>
                </div>

                <div class="article-section">
                    <h2>The Official Statement</h2>
                    <p>The FIA's statement was measured but left little room for ambiguity about the seriousness of the decision: <em>"After careful consideration and consultation with all stakeholders, we have made the difficult decision to cancel these events due to unforeseen regional circumstances. The safety of all personnel, teams, and fans remains our utmost priority."</em></p>
                    <p>Both races had been fixtures of the calendar in recent seasons, and their simultaneous cancellation &mdash; rather than a postponement or relocation &mdash; underlines how serious the underlying circumstances are considered to be.</p>
                </div>

                <div class="article-section">
                    <h2>Impact on the 2026 Championship</h2>
                    <p>With two rounds removed, the 2026 season now runs to 22 races instead of 24. The championship standings are unaffected in principle &mdash; no points are lost, simply two opportunities to score them &mdash; but the removal of two rounds this early in the year does compress the season and removes two data points that could have shifted momentum either way. The next round on the revised calendar becomes the Miami Grand Prix in May.</p>
                    <p>At the time of the announcement, George Russell led the drivers' championship with 51 points, with Mercedes teammate Kimi Antonelli close behind on 47 &mdash; a gap that two fewer races gives both drivers less room to open up or close down before the season reaches its midpoint.</p>
                </div>

                <div class="article-section">
                    <h2>Reaction From the Paddock</h2>
                    <p>Team principals offered a range of responses to the news. Mercedes' Toto Wolff called the decision "disappointing for fans but absolutely the right decision given the circumstances," while Red Bull's Christian Horner struck a more cautious note, observing that "the extended break could be a double-edged sword for championship momentum" &mdash; a reference to the unusually long gap the cancellations create between the Japanese and Miami Grands Prix.</p>
                </div>

                <div class="article-section">
                    <h2>What This Means for Fans</h2>
                    <p>Ticket holders for both cancelled events are being processed for refunds through the respective promoters, with official guidance issued directly by each circuit. For fans following the season, the more immediate consequence is the calendar gap this creates &mdash; explored in full in our companion piece on <a href="f1-33-day-break-japan-miami.html">F1's 33-day break between Japan and Miami</a>.</p>
                </div>
'''
gen_article(
    slug='cancellation-article.html',
    title='F1 Announces Cancellation of Bahrain and Saudi Arabian GPs',
    desc="Formula 1 officially cancels the Bahrain and Saudi Arabian Grands Prix due to unforeseen regional circumstances, cutting the 2026 calendar to 22 races and creating an extended gap before the Miami Grand Prix.",
    date='2026-03-16', display_date='March 16, 2026',
    category='news', label='Breaking News',
    h1='F1 Cancels Bahrain and Saudi Arabian Grands Prix',
    subtitle='The FIA confirms both Middle East rounds will not go ahead as scheduled, trimming the 2026 calendar to 22 races and reshaping the run-in to the Miami Grand Prix.',
    read_time=4,
    body_sections=body,
    related_items=[
        ('f1-33-day-break-japan-miami.html', 'F1 Calendar', "Formula 1 Faces 33-Day Break: Japan to Miami Gap Explained"),
        ('championship.html', 'Standings', '2026 Championship Standings &amp; Progression Graph'),
        ('china-gp.html', 'Race Report', 'Chinese Grand Prix 2026: Full Results &amp; Championship Standings'),
        ('calendar.html', 'Calendar', '2026 F1 Race Calendar &amp; Results'),
    ],
    share_text="F1 cancels Bahrain and Saudi Arabian Grands Prix",
    event='2026 Formula 1 Season',
)
print('cancellation-article.html rewritten')

# ============================================================
# 6. 33-day break Japan-Miami - was ~349 words
# ============================================================
body = '''                <div class="article-intro">
                    <p>Formula 1 is facing an unprecedented 33-day break between the Japanese Grand Prix and the Miami Grand Prix &mdash; a gap that is one full week longer than the sport's traditional summer shutdown, and a direct consequence of the recent cancellation of the Bahrain and Saudi Arabian rounds.</p>
                </div>

                <div class="article-section">
                    <h2>Why Such a Long Break?</h2>
                    <p>The extended hiatus traces directly back to the cancellation of both Middle East races, which were originally scheduled to open the 2026 campaign. With those early-season rounds removed from the calendar entirely rather than rescheduled elsewhere, the gap between Japan and Miami has stretched well beyond what teams would normally expect at this point in the season.</p>
                    <p>F1's traditional summer break runs three weeks, during which factory shutdowns are mandatory across the sport and no on-track or development activity is permitted. This year's Japan-to-Miami gap runs a full week longer than that at four weeks &mdash; making it the single longest pause anywhere on the 2026 calendar, mid-season shutdown included.</p>
                </div>

                <div class="article-section">
                    <h2>Impact on Teams and Drivers</h2>
                    <p>For the teams, the extended gap cuts both ways. On one hand, it offers a genuine opportunity for development work and rest after an intense start to the season since pre-season testing. On the other, maintaining sharpness and competitive edge over such a long period without a race weekend to calibrate against is a real challenge &mdash; car concepts can drift out of tune, and momentum built over a strong run of results can cool off entirely.</p>
                    <p>Drivers will need to stay race-sharp throughout the layoff, and expect many to lean on intensive simulator and physical training programmes to ensure they arrive in Miami at full readiness rather than needing a race or two to shake off the rust.</p>
                </div>

                <div class="article-section">
                    <h2>What This Means for Fans</h2>
                    <p>For F1 fans, the practical effect is a five-week stretch without any Grand Prix action &mdash; the longest such gap anywhere in the 2026 season. It is a good moment to catch up on the season so far: revisit the <a href="china-gp.html">Chinese Grand Prix result</a> and the story of <a href="antonelli-maiden-win.html">Antonelli's maiden win</a>, or get ahead of the calendar with our full <a href="calendar.html">2026 race schedule</a>.</p>
                    <p>When the season resumes, all the momentum questions raised by this break will start to answer themselves in Miami. Follow every session as it happens on our <a href="race-hub.html">Race Hub</a>.</p>
                </div>
'''
gen_article(
    slug='f1-33-day-break-japan-miami.html',
    title="Formula 1 Faces 33-Day Break: Japan to Miami Gap Explained",
    desc="Formula 1 will have an unprecedented 33-day gap between the Japanese and Miami Grands Prix - a week longer than the traditional summer break - following the cancellation of the Bahrain and Saudi Arabian rounds.",
    date='2026-03-16', display_date='March 16, 2026',
    category='news', label='F1 Calendar',
    h1='Explained: Why F1 Has a 33-Day Gap Between Japan and Miami',
    subtitle='The cancellation of the Bahrain and Saudi Arabian Grands Prix has created the longest gap anywhere on the 2026 calendar - a full week longer than F1\'s traditional summer shutdown.',
    read_time=4,
    body_sections=body,
    related_items=[
        ('cancellation-article.html', 'Breaking News', 'F1 Announces Cancellation of Bahrain and Saudi Arabian GPs'),
        ('japan-gp-2026.html', 'Race Preview', 'Japanese Grand Prix 2026: Everything You Need to Know'),
        ('calendar.html', 'Calendar', '2026 F1 Race Calendar &amp; Results'),
        ('race-hub.html', 'Race Hub', "This Weekend's Grand Prix: Times &amp; Results"),
    ],
    share_text="F1's 33-day break between Japan and Miami, explained",
    event='2026 Formula 1 Season',
)
print('f1-33-day-break-japan-miami.html rewritten')
