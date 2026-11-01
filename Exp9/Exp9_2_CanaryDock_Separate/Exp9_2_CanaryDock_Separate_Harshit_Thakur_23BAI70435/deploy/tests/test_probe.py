import importlib.util, unittest
from unittest.mock import patch
from io import BytesIO
from pathlib import Path
spec=importlib.util.spec_from_file_location('probe',Path(__file__).parents[1]/'probe.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class Response(BytesIO):
 status=200
class GateTests(unittest.TestCase):
 @patch.object(mod.time,'sleep')
 def test_healthy_split(self,_):
  replies=[Response(b'{"slot":"canarydock-green","version":"new"}') for i in range(10)]+[Response(b'{"slot":"canarydock-blue","version":"old"}') for i in range(90)]
  with patch.object(mod.urllib.request,'urlopen',side_effect=replies):
   self.assertTrue(mod.probe('http://test','canarydock-green',10)['passed'])
 @patch.object(mod.time,'sleep')
 def test_failed_requests_reject(self,_):
  with patch.object(mod.urllib.request,'urlopen',side_effect=OSError('unhealthy')):
   self.assertFalse(mod.probe('http://test','canarydock-green',10)['passed'])
 @patch.object(mod.time,'sleep')
 def test_wrong_slot_rejects_promotion(self,_):
  with patch.object(mod.urllib.request,'urlopen',side_effect=lambda *a,**k:Response(b'{"slot":"canarydock-blue","version":"old"}')):
   self.assertFalse(mod.probe('http://test','canarydock-green',100)['passed'])
