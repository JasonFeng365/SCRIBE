length = int(input())
arr = list(map(int, input().split()))

res = 0
for i in range(length-2):
	res = max(res, arr[i]*arr[i+1]*arr[i+2])

print(res)