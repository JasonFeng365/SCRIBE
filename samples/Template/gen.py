import random
from os import system

import sys
import hashlib
random.seed(hashlib.sha1(("".join(sys.argv).encode())).hexdigest())
testcaseNumber = int(sys.argv[1])
args = sys.argv[2:]

args = list(map(int, args))

n = args[0]
n = max(1, random.randint(2*n//3, n))

inputPath = f"testcases/input/input{testcaseNumber:02d}.txt"
outputPath = f"testcases/output/output{testcaseNumber:02d}.txt"
with open(inputPath, 'w') as f:
	f.write(f"{n}")

cmd = f"python sol.py < {inputPath} > {outputPath}"
system(cmd)