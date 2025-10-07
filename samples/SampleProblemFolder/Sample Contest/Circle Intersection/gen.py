import random
from os import system

import sys
import hashlib
random.seed(hashlib.sha1(("".join(sys.argv).encode())).hexdigest())
testcaseNumber = int(sys.argv[1])
args = sys.argv[2:]

args = list(map(int, args))

numCircles = args[0]
success = random.randint(0, 1)


def genCircle(already):
	arr = [random.randint(-1000, 1000) for _ in range(3)]
	arr[2] = max(1, abs(arr[2]))
	if success:
		for x, y, r in already:
			centerSqDist = (x-arr[0])**2 + (y-arr[1])**2
			while (r+arr[2])**2 <= centerSqDist: arr[2]+=1
	return arr

def genCircles():
	res = []
	while len(res) < numCircles:
		res.append(genCircle(res))
	return '\n'.join(map(lambda c: ' '.join(map(str, c)), res))


inputPath = f"testcases/input/input{testcaseNumber:02d}.txt"
outputPath = f"testcases/output/output{testcaseNumber:02d}.txt"
with open(inputPath, 'w') as f:
	f.write(genCircles())

cmd = f"python sol.py < {inputPath} > {outputPath}"
system(cmd)