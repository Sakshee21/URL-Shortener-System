Mutatest diagnostic summary
===========================
 - Source location: /home/sakshee/URL-Shortener-System/backend/app/services/click_service.py
 - Test commands: ['pytest', '-q', 'tests']
 - Mode: s
 - Excluded files: []
 - N locations input: 20
 - Random seed: 42

Random sample details
---------------------
 - Total locations mutated: 8
 - Total locations identified: 8
 - Location sample coverage: 100.00 %


Running time details
--------------------
 - Clean trial 1 run time: 0:00:40.680073
 - Clean trial 2 run time: 0:00:40.928239
 - Mutation trials total run time: 0:10:12.170063

Overall mutation trial summary
==============================
 - DETECTED: 12
 - SURVIVED: 3
 - TOTAL RUNS: 15
 - RUN DATETIME: 2026-04-11 11:03:36.616741


Mutations by result status
==========================


SURVIVED
--------
 - backend/app/services/click_service.py: (l: 22, c: 16) - mutation from <class 'ast.Eq'> to <class 'ast.Lt'>
 - backend/app/services/click_service.py: (l: 22, c: 46) - mutation from <class 'ast.Eq'> to <class 'ast.Lt'>
 - backend/app/services/click_service.py: (l: 33, c: 4) - mutation from If_Statement to If_True


DETECTED
--------
 - backend/app/services/click_service.py: (l: 16, c: 64) - mutation from None to False
 - backend/app/services/click_service.py: (l: 16, c: 64) - mutation from None to True
 - backend/app/services/click_service.py: (l: 21, c: 8) - mutation from <class 'ast.IsNot'> to <class 'ast.Is'>
 - backend/app/services/click_service.py: (l: 24, c: 15) - mutation from None to False
 - backend/app/services/click_service.py: (l: 24, c: 15) - mutation from None to True
 - backend/app/services/click_service.py: (l: 30, c: 4) - mutation from AugAssign_Add to AugAssign_Div
 - backend/app/services/click_service.py: (l: 30, c: 4) - mutation from AugAssign_Add to AugAssign_Mult
 - backend/app/services/click_service.py: (l: 30, c: 4) - mutation from AugAssign_Add to AugAssign_Sub
 - backend/app/services/click_service.py: (l: 33, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/click_service.py: (l: 34, c: 8) - mutation from AugAssign_Add to AugAssign_Mult
 - backend/app/services/click_service.py: (l: 34, c: 8) - mutation from AugAssign_Add to AugAssign_Sub
 - backend/app/services/click_service.py: (l: 34, c: 8) - mutation from AugAssign_Add to AugAssign_Div