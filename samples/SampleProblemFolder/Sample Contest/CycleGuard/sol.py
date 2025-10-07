global total
total = 0

distances = {}

def join(username):
	distances[username]=0

def update(username, n):
	global total
	distances[username] += n
	total += n

def leave(username):
	global total
	total -= distances[username]
	del distances[username]

for _ in range(int(input())):
	arr = input().split()
	if arr[0]=='j': join(arr[1])
	elif arr[0]=='r': update(arr[1], int(arr[2]))
	elif arr[0]=='l': leave(arr[1])
	print(total)
	# print(sum(distances.values()))