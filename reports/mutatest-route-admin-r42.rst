Mutatest diagnostic summary
===========================
 - Source location: /home/sakshee/URL-Shortener-System/backend/app/routes/admin.py
 - Test commands: ['pytest', '-q', 'tests']
 - Mode: s
 - Excluded files: []
 - N locations input: 15
 - Random seed: 42

Random sample details
---------------------
 - Total locations mutated: 2
 - Total locations identified: 2
 - Location sample coverage: 100.00 %


Running time details
--------------------
 - Clean trial 1 run time: 0:00:22.721844
 - Clean trial 2 run time: 0:00:23.773609
 - Mutation trials total run time: 0:00:46.100187

Overall mutation trial summary
==============================
 - UNKNOWN: 1
 - DETECTED: 2
 - TOTAL RUNS: 3
 - RUN DATETIME: 2026-04-11 12:17:33.948097


Mutations by result status
==========================


DETECTED
--------
 - backend/app/routes/admin.py: (l: 29, c: 34) - mutation from None to False
 - backend/app/routes/admin.py: (l: 29, c: 34) - mutation from None to True


UNKNOWN
-------
 - backend/app/routes/admin.py: (l: 29, c: 13) - mutation from None to False