#!/usr/bin/env python3
"""Fail the gate on any failed request, excess latency, or wrong traffic split."""
import json, sys, time, urllib.request
from collections import Counter
from pathlib import Path

def probe(base, candidate, expected, samples=100):
    slots=Counter(); failures=[]; latencies=[]
    for _ in range(samples):
        started=time.monotonic()
        try:
            with urllib.request.urlopen(base+'/api/hello',timeout=3) as response:
                body=json.load(response)
                if response.status != 200 or not body.get('version'):
                    raise ValueError('Missing version or bad HTTP status')
                if body.get('slot') not in ('canarydock-blue','canarydock-green'):
                    raise ValueError('Unexpected backend slot')
                slots[body['slot']]+=1
        except Exception as exc:
            failures.append(str(exc))
        latencies.append((time.monotonic()-started)*1000)
        time.sleep(.03)
    observed=100*slots[candidate]/samples
    p95=sorted(latencies)[int(.95*(samples-1))]
    # Weighted round robin is request-level; allow ten percentage points of sampling variation.
    split_ok=(observed==100 if expected==100 else abs(observed-expected)<=10 and slots[candidate]>0)
    return {'expectedCanaryPercent':expected,'observedCanaryPercent':observed,'requests':samples,
            'slots':dict(slots),'errors':failures,'p95Milliseconds':round(p95,2),
            'passed':not failures and p95<1500 and split_ok}

if __name__=='__main__':
    base,candidate,expected,output=sys.argv[1:]
    result=probe(base,candidate,int(expected))
    Path(output).parent.mkdir(parents=True,exist_ok=True)
    Path(output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
    sys.exit(0 if result['passed'] else 1)
