Mutatest diagnostic summary
===========================
 - Source location: /home/sakshee/URL-Shortener-System/backend/app/routes/url.py
 - Test commands: ['pytest', '-q', 'tests']
 - Mode: s
 - Excluded files: []
 - N locations input: 15
 - Random seed: 42

Random sample details
---------------------
 - Total locations mutated: 5
 - Total locations identified: 5
 - Location sample coverage: 100.00 %


Running time details
--------------------
 - Clean trial 1 run time: 0:00:23.510369
 - Clean trial 2 run time: 0:00:22.967723
 - Mutation trials total run time: 0:02:51.801578

Overall mutation trial summary
==============================
 - DETECTED: 3
 - SURVIVED: 4
 - TOTAL RUNS: 7
 - RUN DATETIME: 2026-04-11 11:57:15.095779


Mutations by result status
==========================


SURVIVED
--------
 - backend/app/routes/url.py: (l: 116, c: 45) - mutation from False to True
 - backend/app/routes/url.py: (l: 132, c: 45) - mutation from False to True
 - backend/app/routes/url.py: (l: 148, c: 45) - mutation from False to True
 - backend/app/routes/url.py: (l: 170, c: 45) - mutation from False to True


DETECTED
--------
 - backend/app/routes/url.py: (l: 47, c: 51) - mutation from None to False
 - backend/app/routes/url.py: (l: 47, c: 51) - mutation from None to True
 - backend/app/routes/url.py: (l: 116, c: 45) - mutation from False to None