Mutatest diagnostic summary
===========================
 - Source location: /home/sakshee/URL-Shortener-System/backend/app/services/security_service.py
 - Test commands: ['pytest', '-q', 'tests']
 - Mode: s
 - Excluded files: []
 - N locations input: 20
 - Random seed: 42

Random sample details
---------------------
 - Total locations mutated: 20
 - Total locations identified: 31
 - Location sample coverage: 64.52 %


Running time details
--------------------
 - Clean trial 1 run time: 0:00:41.406959
 - Clean trial 2 run time: 0:00:43.620140
 - Mutation trials total run time: 0:14:11.290421

Overall mutation trial summary
==============================
 - SURVIVED: 15
 - UNKNOWN: 2
 - DETECTED: 6
 - TOTAL RUNS: 23
 - RUN DATETIME: 2026-04-11 10:51:29.876122


Mutations by result status
==========================


SURVIVED
--------
 - backend/app/services/security_service.py: (l: 11, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/security_service.py: (l: 14, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/security_service.py: (l: 23, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/security_service.py: (l: 29, c: 8) - mutation from If_Statement to If_False
 - backend/app/services/security_service.py: (l: 44, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/security_service.py: (l: 57, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/security_service.py: (l: 58, c: 8) - mutation from AugAssign_Add to AugAssign_Div
 - backend/app/services/security_service.py: (l: 61, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/security_service.py: (l: 61, c: 7) - mutation from <class 'ast.Gt'> to <class 'ast.GtE'>
 - backend/app/services/security_service.py: (l: 62, c: 8) - mutation from AugAssign_Add to AugAssign_Sub
 - backend/app/services/security_service.py: (l: 65, c: 4) - mutation from AugAssign_Add to AugAssign_Mult
 - backend/app/services/security_service.py: (l: 65, c: 13) - mutation from <class 'ast.Mult'> to <class 'ast.Div'>
 - backend/app/services/security_service.py: (l: 67, c: 7) - mutation from <class 'ast.GtE'> to <class 'ast.Gt'>
 - backend/app/services/security_service.py: (l: 70, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/security_service.py: (l: 70, c: 7) - mutation from <class 'ast.GtE'> to <class 'ast.Lt'>


DETECTED
--------
 - backend/app/services/security_service.py: (l: 14, c: 7) - mutation from <class 'ast.NotIn'> to <class 'ast.In'>
 - backend/app/services/security_service.py: (l: 23, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/security_service.py: (l: 44, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/security_service.py: (l: 49, c: 7) - mutation from <class 'ast.Or'> to <class 'ast.And'>
 - backend/app/services/security_service.py: (l: 49, c: 7) - mutation from <class 'ast.In'> to <class 'ast.NotIn'>
 - backend/app/services/security_service.py: (l: 65, c: 4) - mutation from AugAssign_Add to AugAssign_Div


UNKNOWN
-------
 - backend/app/services/security_service.py: (l: 6, c: 22) - mutation from <class 'ast.Div'> to <class 'ast.Sub'>
 - backend/app/services/security_service.py: (l: 6, c: 22) - mutation from <class 'ast.Div'> to <class 'ast.Pow'>