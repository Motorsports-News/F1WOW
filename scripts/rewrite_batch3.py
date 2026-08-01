# Batch 3: expand the three articles still under 600 words
import re

# ---- antonelli-maiden-win.html ----
s = open('antonelli-maiden-win.html', encoding='utf-8').read()
target = '''                    <p>Stat credit for the margin and lap data: <a href="https://instagram.com/f1guydan" target="_blank" rel="noopener">@f1guydan</a>, via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>.</p>
                </div>'''
addition = '''                    <p>Stat credit for the margin and lap data: <a href="https://instagram.com/f1guydan" target="_blank" rel="noopener">@f1guydan</a>, via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>.</p>
                </div>

                <div class="article-section">
                    <h2>The Rookie Benchmark</h2>
                    <p>Winning from pole in only a second Grand Prix start invites immediate comparison to the handful of drivers in the modern era who have managed a debut-season victory, and Antonelli's version of it came with an added layer of difficulty: doing it alongside a genuine championship-calibre teammate in George Russell, rather than in a car nobody else could get near. The margin at the flag, 5.515 seconds, was earned rather than inherited &mdash; built lap by lap through a middle stint where Russell had every opportunity to close the gap and simply couldn't.</p>
                    <p>For Hamilton, third place carried its own weight. A podium in only his second race for Ferrari, after more than a decade at Mercedes, was the first tangible sign that the switch could pay off quickly rather than requiring a lengthy adjustment period &mdash; a storyline that would only grow larger as the season went on.</p>
                </div>'''
assert target in s, "antonelli target not found"
s = s.replace(target, addition)
open('antonelli-maiden-win.html', 'w', encoding='utf-8').write(s)
print('antonelli-maiden-win.html expanded')

# ---- cancellation-article.html ----
s = open('cancellation-article.html', encoding='utf-8').read()
target = '''                    <p>Ticket holders for both cancelled events are being processed for refunds through the respective promoters, with official guidance issued directly by each circuit. For fans following the season, the more immediate consequence is the calendar gap this creates &mdash; explored in full in our companion piece on <a href="f1-33-day-break-japan-miami.html">F1's 33-day break between Japan and Miami</a>.</p>
                </div>'''
addition = '''                    <p>Ticket holders for both cancelled events are being processed for refunds through the respective promoters, with official guidance issued directly by each circuit. For fans following the season, the more immediate consequence is the calendar gap this creates &mdash; explored in full in our companion piece on <a href="f1-33-day-break-japan-miami.html">F1's 33-day break between Japan and Miami</a>.</p>
                </div>

                <div class="article-section">
                    <h2>A Rare Double Cancellation</h2>
                    <p>Formula 1 has weathered individual race cancellations before, but losing two consecutive rounds simultaneously &mdash; rather than a single event, or a postponement to a later date &mdash; is a considerably rarer occurrence for the sport. It removes not just two race weekends but two full sets of practice, qualifying and race sessions from the season's data, denying every team two opportunities to test updates, gather tyre and strategy data, and build momentum in exactly the window when early-season form is still being established.</p>
                    <p>For a sport that prizes consistency of calendar and predictability for broadcasters, sponsors and travelling fans alike, a double cancellation of this kind inevitably raises questions that will likely shape how the affected regions are treated in future calendar planning &mdash; even as the FIA's statement made clear that safety, not scheduling convenience, drove the decision.</p>
                </div>'''
assert target in s, "cancellation target not found"
s = s.replace(target, addition)
open('cancellation-article.html', 'w', encoding='utf-8').write(s)
print('cancellation-article.html expanded')

# ---- f1-33-day-break-japan-miami.html ----
s = open('f1-33-day-break-japan-miami.html', encoding='utf-8').read()
target = '''                    <p>When the season resumes, all the momentum questions raised by this break will start to answer themselves in Miami. Follow every session as it happens on our <a href="race-hub.html">Race Hub</a>.</p>
                </div>'''
addition = '''                    <p>When the season resumes, all the momentum questions raised by this break will start to answer themselves in Miami. Follow every session as it happens on our <a href="race-hub.html">Race Hub</a>.</p>
                </div>

                <div class="article-section">
                    <h2>How Teams Typically Use a Long Gap</h2>
                    <p>Extended gaps like this one are rare enough that they tend to be used very deliberately by the teams with the resources to do so. Wind tunnel and CFD allocations under the cost cap are finite, and a longer-than-usual window between races is often the moment a team chooses to push through a significant aerodynamic update rather than spreading development more thinly across the season. For teams further down the order, the same gap can instead become an opportunity to fix reliability issues that a tighter calendar wouldn't have allowed time to properly diagnose.</p>
                    <p>The flip side is technical: cars are complex, finely tuned machines, and components that have bedded in over several race weekends can behave slightly differently after a month in storage. It is not unusual to see a team or two arrive at the first race back from a long layoff still working through set-up issues that a shorter gap would never have exposed &mdash; another reason the Miami weekend, when it arrives, will be watched closely for early signs of who used the break best.</p>
                </div>'''
assert target in s, "33-day-break target not found"
s = s.replace(target, addition)
open('f1-33-day-break-japan-miami.html', 'w', encoding='utf-8').write(s)
print('f1-33-day-break-japan-miami.html expanded')
