Mutatest diagnostic summary
===========================
 - Source location: /home/sakshee/URL-Shortener-System/backend/app/services/url_service.py
 - Test commands: ['pytest', '-q', 'tests']
 - Mode: s
 - Excluded files: []
 - N locations input: 20
 - Random seed: 42

Random sample details
---------------------
 - Total locations mutated: 20
 - Total locations identified: 158
 - Location sample coverage: 12.66 %


Running time details
--------------------
 - Clean trial 1 run time: 0:00:43.391252
 - Clean trial 2 run time: 0:00:39.547409
 - Mutation trials total run time: 0:20:36.872119

Overall mutation trial summary
==============================
 - SURVIVED: 16
 - DETECTED: 14
 - UNKNOWN: 1
 - TOTAL RUNS: 31
 - RUN DATETIME: 2026-04-11 10:22:26.319918


Mutations by result status
==========================


SURVIVED
--------
 - backend/app/services/url_service.py: (l: 33, c: 8) - mutation from <class 'ast.Eq'> to <class 'ast.Gt'>
 - backend/app/services/url_service.py: (l: 33, c: 8) - mutation from <class 'ast.And'> to <class 'ast.Or'>
 - backend/app/services/url_service.py: (l: 33, c: 29) - mutation from <class 'ast.In'> to <class 'ast.NotIn'>
 - backend/app/services/url_service.py: (l: 63, c: 32) - mutation from <class 'ast.Eq'> to <class 'ast.GtE'>
 - backend/app/services/url_service.py: (l: 74, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/url_service.py: (l: 79, c: 18) - mutation from False to None
 - backend/app/services/url_service.py: (l: 104, c: 22) - mutation from True to None
 - backend/app/services/url_service.py: (l: 145, c: 37) - mutation from <class 'ast.Eq'> to <class 'ast.GtE'>
 - backend/app/services/url_service.py: (l: 166, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/url_service.py: (l: 196, c: 7) - mutation from <class 'ast.In'> to <class 'ast.NotIn'>
 - backend/app/services/url_service.py: (l: 278, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/url_service.py: (l: 363, c: 106) - mutation from True to False
 - backend/app/services/url_service.py: (l: 419, c: 24) - mutation from <class 'ast.Sub'> to <class 'ast.Add'>
 - backend/app/services/url_service.py: (l: 433, c: 16) - mutation from <class 'ast.Eq'> to <class 'ast.Gt'>
 - backend/app/services/url_service.py: (l: 519, c: 43) - mutation from <class 'ast.IsNot'> to <class 'ast.Is'>
 - backend/app/services/url_service.py: (l: 576, c: 4) - mutation from If_Statement to If_False


DETECTED
--------
 - backend/app/services/url_service.py: (l: 63, c: 32) - mutation from <class 'ast.Eq'> to <class 'ast.Lt'>
 - backend/app/services/url_service.py: (l: 86, c: 47) - mutation from None to True
 - backend/app/services/url_service.py: (l: 86, c: 47) - mutation from None to False
 - backend/app/services/url_service.py: (l: 145, c: 37) - mutation from <class 'ast.Eq'> to <class 'ast.Lt'>
 - backend/app/services/url_service.py: (l: 147, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/url_service.py: (l: 147, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/url_service.py: (l: 164, c: 4) - mutation from If_Statement to If_False
 - backend/app/services/url_service.py: (l: 164, c: 4) - mutation from If_Statement to If_True
 - backend/app/services/url_service.py: (l: 419, c: 24) - mutation from <class 'ast.Sub'> to <class 'ast.Mod'>
 - backend/app/services/url_service.py: (l: 419, c: 24) - mutation from <class 'ast.Sub'> to <class 'ast.Div'>
 - backend/app/services/url_service.py: (l: 419, c: 24) - mutation from <class 'ast.Sub'> to <class 'ast.FloorDiv'>
 - backend/app/services/url_service.py: (l: 419, c: 24) - mutation from <class 'ast.Sub'> to <class 'ast.Pow'>
 - backend/app/services/url_service.py: (l: 419, c: 24) - mutation from <class 'ast.Sub'> to <class 'ast.Mult'>
 - backend/app/services/url_service.py: (l: 576, c: 4) - mutation from If_Statement to If_True


UNKNOWN
-------
 - backend/app/services/url_service.py: (l: 62, c: 63) - mutation from None to False