Mutatest diagnostic summary
===========================
 - Source location: /home/sakshee/URL-Shortener-System/backend/app/services/auth_service.py
 - Test commands: ['pytest', '-q', 'tests']
 - Mode: s
 - Excluded files: []
 - N locations input: 20
 - Random seed: 42

Random sample details
---------------------
 - Total locations mutated: 6
 - Total locations identified: 6
 - Location sample coverage: 100.00 %


Running time details
--------------------
 - Clean trial 1 run time: 0:00:41.927850
 - Clean trial 2 run time: 0:00:42.150268
 - Mutation trials total run time: 0:07:44.013565

Overall mutation trial summary
==============================
 - DETECTED: 12
 - SURVIVED: 1
 - TOTAL RUNS: 13
 - RUN DATETIME: 2026-04-11 11:17:48.483856


Mutations by result status
==========================


SURVIVED
--------
 - backend/app/services/auth_service.py: (l: 24, c: 33) - mutation from <class 'ast.Eq'> to <class 'ast.GtE'>


DETECTED
--------
 - backend/app/services/auth_service.py: (l: 7, c: 42) - mutation from <class 'ast.Eq'> to <class 'ast.GtE'>
 - backend/app/services/auth_service.py: (l: 7, c: 42) - mutation from <class 'ast.Eq'> to <class 'ast.Gt'>
 - backend/app/services/auth_service.py: (l: 7, c: 42) - mutation from <class 'ast.Eq'> to <class 'ast.NotEq'>
 - backend/app/services/auth_service.py: (l: 7, c: 42) - mutation from <class 'ast.Eq'> to <class 'ast.Lt'>
 - backend/app/services/auth_service.py: (l: 7, c: 42) - mutation from <class 'ast.Eq'> to <class 'ast.LtE'>
 - backend/app/services/auth_service.py: (l: 9, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/auth_service.py: (l: 9, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/auth_service.py: (l: 26, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/auth_service.py: (l: 26, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/auth_service.py: (l: 26, c: 7) - mutation from <class 'ast.Or'> to <class 'ast.And'>
 - backend/app/services/auth_service.py: (l: 29, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/auth_service.py: (l: 29, c: 4) - mutation from If_Statement to If_True