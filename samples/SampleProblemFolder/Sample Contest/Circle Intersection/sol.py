arr = [list(map(int, input().split())) for _ in range(3)]

def ok(c1, c2):
	x1, y1, r1 = c1
	x2, y2, r2 = c2

	centerSqDist = (x2-x1)**2 + (y2-y1)**2
	radiusSqDist = (r1+r2)**2

	# print(c1, c2, radiusSqDist, centerSqDist)

	return radiusSqDist >= centerSqDist


def sta():
	for i in range(3):
		for j in range(i+1, 3):
			if not ok(arr[i], arr[j]): return "NO"
	return "YES"

print(sta())