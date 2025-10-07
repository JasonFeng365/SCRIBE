import random
from os import system

import sys
import hashlib
random.seed(hashlib.sha1(("".join(sys.argv).encode())).hexdigest())
testcaseNumber = int(sys.argv[1])
args = sys.argv[2:]

args = list(map(int, args))

length = args[0]
arr = [random.randint(1, 1000) for _ in range(length)]

inputPath = f"testcases/input/input{testcaseNumber:02d}.txt"
outputPath = f"testcases/output/output{testcaseNumber:02d}.txt"
with open(inputPath, 'w') as f:
	f.write(f"{length}\n")
	f.write(" ".join(map(str, arr)))

cmd = f"python sol.py < {inputPath} > {outputPath}"
system(cmd)