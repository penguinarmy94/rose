import unittest
import u_motor
#import u_brain
import u_db

loader = unittest.TestLoader()
suite = unittest.TestSuite()

suite.addTests(loader.loadTestsFromModule(u_motor))
#suite.addTest(loader.loadTestsFromModule(u_brain))
suite.addTest(loader.loadTestsFromModule(u_db))

runner = unittest.TextTestRunner(verbosity=3)
result = runner.run(suite)

