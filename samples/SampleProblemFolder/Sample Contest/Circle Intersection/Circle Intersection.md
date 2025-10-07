### SCPE Spring 2025

## Circle Intersection

**Jason Feng**

You are given the **centers** and **radii** of $3$ circles on the xy-coordinate plane. Determine if each pair of circles is **connected**.

A pair of circles is connected if they overlap at one or more points. If one circle is completely contained within another, that pair overlaps.

The centers of each circle is a $(x, y)$ coordinate pairs, where $x$ and $y$ are integers. Each radius $r$ is an integer as well. All circles are unique; there are no two circles with the exact same center and radius.

### Objective

Given $3$ circles, determine if each pair of circles are **connected**. If all pairs of circles are connected, print `YES`. Otherwise, print `NO`.

### Input Specification
There are $3$ lines of input, where line $i$ contains a triplet of integers: coordinates $(x_i, y_i)$ and radius $r_i$ of one single circle.

Note: you are **encouraged** to graph the following testcases on Desmos or similar software!

### Constraints
* $-10^4 \le x_i,y_i,r_i \le 10^4$


### Output Specification
Output `YES` if the circles all intersect at one or more point, and `NO` otherwise.

<div style="page-break-after: always;"></div>

<table><tr>
<td><b>Sample Input</b></td>
<td><b>Sample Output</b></td>
</tr>

<tr><td>

```
1 4 5
2 11 3
1 9 2
```

</td><td>

```
YES
```
</td></tr>

<tr><td>

```
-3 1 5
3 -2 2
3 2 3
```

</td><td>

```
YES
```
</td></tr>

<tr><td>

```
-2 -1 2
2 -1 2
0 2 2
```

</td><td>

```
YES
```
</td></tr>

<tr><td>

```
-2 -1 2
2 -1 2
0 3 2
```

</td><td>

```
NO
```
</td></tr>

</table>