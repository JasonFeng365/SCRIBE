import random
from os import system

import sys
import hashlib
random.seed(hashlib.sha1(("".join(sys.argv).encode())).hexdigest())
testcaseNumber = int(sys.argv[1])
args = sys.argv[2:]

args = list(map(int, args))

length = args[0]

usernames = set()

def genUsername():
	length = random.randint(1, 10)
	return "".join([chr(ord('a')+random.randint(0, 25)) for _ in range(length)])

numUsers = random.randint(length//10, length//2)
for _ in range(numUsers): usernames.add(genUsername())
usernames = list(usernames)
numUsers = len(usernames)

mode=[0]*numUsers

def genQuery():
	i = random.randint(0, numUsers-1)
	user = usernames[i]
	# Not in pack
	if mode[i]==0:
		mode[i]=1
		return f"j {user}"
	else:
		if random.randint(0,4)==0:
			mode[i]=0
			return f"l {user}"
		else:
			dist = random.randint(0, 10000)
			return f"r {user} {dist}"

queries = [genQuery() for _ in range(length)]


a, b, c = sorted([random.randint(0, 100) for _ in range(3)])
n = random.randint(0, args[0])

inputPath = f"testcases/input/input{testcaseNumber:02d}.txt"
outputPath = f"testcases/output/output{testcaseNumber:02d}.txt"
with open(inputPath, 'w') as f:
	f.write(f"{length}\n")
	f.write("\n".join(queries))

cmd = f"python sol.py < {inputPath} > {outputPath}"
system(cmd)