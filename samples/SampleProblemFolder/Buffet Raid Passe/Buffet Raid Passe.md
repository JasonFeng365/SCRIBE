### SCPE Spring 2025

## Buffet Raid Passé

**Jason Feng**

Having eaten your fill at the buffet, you get ready to leave. But instead of leaving normally, you decide to be dramatic about it, and intentionally get kicked out of the buffet.

This particular buffet has $N$ foods lined up in a row, but kicks you out if you eat **three foods in a row**. You are given the **compatibility** $C$ of each food. The higher the **product** of some foods' compatibility values, the more delicious they are together. You want to find the **three consecutive foods** with the highest **product of compatibility**.

For example, if three foods in a row have compatibility values of $2$, $1$, and $4$, their total product of compatibility is $2*1*4=8$.

## Objective

Given $N$ foods, where food $i$ has a compatibility of $C_i$, output the **highest product of compatibility values** of any consecutive triplet of food.

## Input Specification

The first line has one element $N$: the number of foods in the buffet.
The second line has $N$ space-separated integers, where the $i$-th integer is the compatibility of the $i$-th food $C_i$.


### Constraints
* $3 \le N \le 10^5$
* $1 \le C_i \le 1000$

<div style="page-break-after: always;"></div>

## Output Specification
Output the highest product of compatibility values of any three foods in a row.

<table><tr>
<td><b>Sample Input</b></td>
<td><b>Sample Output</b></td>
</tr>

<tr><td>

```
4
3 2 1 1
```

</td><td>

```
6
```
</td></tr>

<tr><td>

```
5
2 4 6 1 9
```

</td><td>

```
54
```
</td></tr>

<tr><td>

```
5
4 2 4 1 8 4 1
```

</td><td>

```
32
```
</td></tr>

<tr><td>

```
3
1000 1000 1000
```

</td><td>

```
1000000000
```
</td></tr>

</table>

In the first testcase, the two triplets are $(3, 2, 1)$ and $(2, 1, 1)$, with products of $6$ and $2$ respectively.

In the second testcase, the three triplets are $(2, 4, 6)$, $(4,6,1)$, and $(6,1,9)$, with products of $48$, $24$, and $54$.

In the third testcase, there are three triplets which multiply to $32$, the highest possible product.