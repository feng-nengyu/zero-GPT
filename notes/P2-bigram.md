# P2 学习笔记：从 Bigram 统计模型到神经网络语言模型

日期：2026-08-26  
课程进度：P2（进行中）  
参考复现：[karpathy/makemore](https://github.com/karpathy/makemore)  
个人代码：[notebooks/bigram.ipynb](../notebooks/bigram.ipynb)

> 本笔记记录字符级 Bigram 语言模型的两种实现：先直接统计相邻字符出现次数，再用 one-hot 输入和一个 `27 × 27` 的权重矩阵，以神经网络训练得到同类概率模型。

## 1. 今天完成的内容

- 读取 `names.txt`，理解 `read()`、`splitlines()` 和字符串列表。
- 用 `zip(chs, chs[1:])` 构造相邻字符对。
- 建立 `stoi`（字符到编号）和 `itos`（编号到字符）。
- 构造 `27 × 27` 的 Bigram 计数矩阵 `N` 并可视化。
- 按行归一化得到条件概率矩阵 `P`。
- 理解 `dim=1`、`keepdim=True` 和广播。
- 使用 `torch.multinomial` 按概率逐字符生成名字。
- 用 log-likelihood、negative log-likelihood 评价模型。
- 把字符编号转成 one-hot 向量，用 `xenc @ W` 实现神经网络版 Bigram。
- 理解 logits、softmax、前向传播、反向传播和梯度下降。
- 在损失中加入 L2 正则化，理解正则化系数 `0.01` 的作用。

## 2. Bigram 在学习什么

Bigram 只根据当前字符预测下一个字符：

```text
当前字符 -> 下一个字符
```

例如名字 `emma` 加上开始/结束标记后是：

```python
[".", "e", "m", "m", "a", "."]
```

相邻训练样本为：

```text
. -> e
e -> m
m -> m
m -> a
a -> .
```

`.` 不是普通句号，而是特殊 token：位于开头时表示“名字开始”，位于结尾时表示“名字结束”。

## 3. 字符与编号

Tensor 的下标必须是整数，因此需要双向映射：

```python
chars = sorted(set("".join(words)))
stoi = {char: index + 1 for index, char in enumerate(chars)}
stoi["."] = 0
itos = {index: char for char, index in stoi.items()}
```

- `stoi`：string to integer，例如 `stoi["a"] == 1`。
- `itos`：integer to string，例如 `itos[1] == "a"`。
- `enumerate(chars)` 产生 `(编号, 字符)`。
- `stoi.items()` 产生 `(字符, 编号)`；建立 `itos` 时交换键和值。

也可以先建立字符表，让列表下标直接充当编号：

```python
itos = ["."] + chars
stoi = {char: index for index, char in enumerate(itos)}
```

## 4. 计数矩阵 `N`

```python
N = torch.zeros((27, 27), dtype=torch.int32)

for word in words:
    chs = ["."] + list(word) + ["."]
    for ch1, ch2 in zip(chs, chs[1:]):
        ix1 = stoi[ch1]
        ix2 = stoi[ch2]
        N[ix1, ix2] += 1
```

矩阵元素的意义：

```python
N[i, j]
```

表示字符 `itos[i]` 后面紧跟字符 `itos[j]` 的次数。因此：

- 行是当前字符；
- 列是下一个字符；
- `N[0]` 统计所有首字母；
- `N[:, 0]` 统计每个字符作为末尾字符的次数。

`append()` 在准备神经网络训练集时负责把新元素追加到列表末尾：

```python
xs.append(ix1)  # 当前字符编号
ys.append(ix2)  # 目标字符编号
```

不要写成 `xs = xs.append(ix1)`，因为 `append()` 原地修改列表，返回值是 `None`。

## 5. 从次数变成概率

为了让每一行成为一个概率分布：

```python
P = (N + 5).float()
P = P / P.sum(dim=1, keepdim=True)
```

这里的核心是：

```text
P[i, j] = N[i, j] / 第 i 行的总次数
```

也就是条件概率：

```text
P(下一个字符=j | 当前字符=i)
```

### 为什么按行求和

生成时当前字符 `i` 已经确定，需要在这一行的 27 个候选“下一个字符”中进行选择。因此固定行、遍历列，对 `dim=1` 求和。

如果按列归一化，得到的会是“已知下一个字符，前一个字符是什么”的反向概率，不符合从左向右生成名字的方向。

### `keepdim=True`

```python
P.shape                               # (27, 27)
P.sum(dim=1).shape                    # (27,)
P.sum(dim=1, keepdim=True).shape      # (27, 1)
```

`keepdim=True` 会保留被求和的维度，并把它的长度设为 `1`。`(27, 1)` 明确表示一个竖直的行总和向量，广播时会让第 `i` 行的所有元素都除以第 `i` 行自己的总和。

如果省略它，`(27,)` 会从最右侧与 `(27, 27)` 对齐。因为矩阵恰好是方阵，代码可能不报错，却会按错误方向广播。

### 为什么加 `5`

```python
P = (N + 5).float()
```

这是给每一种字符组合增加虚拟计数，使未出现过的组合也具有很小的非零概率。它可以：

- 避免 `log(0)`；
- 减少对训练数据的过度自信；
- 让概率分布更平滑。

## 6. 按概率生成名字

```python
g = torch.Generator().manual_seed(2147483647)

for _ in range(50):
    out = []
    ix = 0

    while True:
        p = P[ix]
        ix = torch.multinomial(
            p,
            num_samples=1,
            replacement=True,
            generator=g,
        ).item()
        out.append(itos[ix])
        if ix == 0:
            break

    print("".join(out))
```

生成过程：

1. 从 `ix = 0`，即开始 token `.` 出发；
2. 用 `p = P[ix]` 取出当前字符对应的一整行概率；
3. `torch.multinomial` 按概率抽取下一个字符；
4. 把新字符作为下一轮的当前字符；
5. 抽到 `0` 时结束名字。

必须写小写 `p = P[ix]`。若写成 `P = P[ix]`，会把完整概率矩阵覆盖成一行，继续循环时产生索引错误。

固定 `manual_seed` 可以复现同一组随机结果；它不会让抽样失去随机性，只是让随机序列可以重复。

## 7. 用负对数似然评价模型

一个字符对的预测概率越大，说明模型越喜欢这个字符组合。整个数据集的似然是所有正确字符概率的乘积，但大量小数相乘容易数值下溢，所以使用对数把乘法转成加法：

```python
log_likelihood = 0.0
n = 0

for word in words:
    chs = ["."] + list(word) + ["."]
    for ch1, ch2 in zip(chs, chs[1:]):
        prob = P[stoi[ch1], stoi[ch2]]
        log_likelihood += torch.log(prob)
        n += 1

nll = -log_likelihood
average_nll = nll / n
```

- 正确答案的概率越接近 `1`，`log(prob)` 越接近 `0`。
- 正确答案的概率越小，负对数惩罚越大。
- 所以平均 NLL 越小，模型越好。

## 8. 神经网络版 Bigram

### 8.1 构造输入与目标

```python
xs, ys = [], []

for word in words:
    chs = ["."] + list(word) + ["."]
    for ch1, ch2 in zip(chs, chs[1:]):
        xs.append(stoi[ch1])
        ys.append(stoi[ch2])

xs = torch.tensor(xs)
ys = torch.tensor(ys)
num = xs.nelement()
```

`xs[k]` 是第 `k` 个当前字符，`ys[k]` 是它对应的正确下一个字符。

### 8.2 One-hot 编码

```python
import torch.nn.functional as F

xenc = F.one_hot(xs, num_classes=27).float()
```

字符编号本身没有大小关系，编号 `13` 不代表比编号 `5` 更重要。One-hot 把一个编号变成长度为 27 的向量，只有该编号所在位置为 `1`。

`F.one_hot` 返回整数 Tensor，而矩阵乘法的权重是浮点数，所以需要 `.float()`。它等价于 `.to(dtype=torch.float32)`。

### 8.3 权重与 logits

```python
g = torch.Generator().manual_seed(2147483647)
W = torch.randn((27, 27), generator=g, requires_grad=True)
logits = xenc @ W
```

- `W` 有 27 行、27 列。
- 每个 one-hot 输入乘以 `W`，效果等价于选择 `W` 中当前字符对应的一行。
- 这一行的 27 个值是对下一字符的原始评分，即 logits。
- `requires_grad=True` 要求 PyTorch 为 `W` 构建计算图并计算梯度。

### 8.4 手写 softmax

```python
counts = logits.exp()
probs = counts / counts.sum(dim=1, keepdim=True)
```

`exp()` 把任意实数评分变成正数，再按行归一化，使每行总和为 `1`。这两步合起来就是 softmax。

更稳定的实际写法通常使用：

```python
probs = F.softmax(logits, dim=1)
```

## 9. 损失、正则化和梯度下降

```python
loss = (
    -probs[torch.arange(num), ys].log().mean()
    + 0.01 * (W**2).mean()
)
```

第一项选择每个样本正确标签对应的概率，并计算平均 NLL。第二项是 L2 正则化：

```python
0.01 * (W**2).mean()
```

- `(W**2).mean()` 惩罚过大的正、负权重；
- 系数 `0.01` 控制惩罚强度；
- 系数太小，约束作用弱；
- 系数太大，`W` 会被过度推向 `0`，概率接近均匀分布，导致欠拟合。

这里 `0.01` 的意思是：主要优化预测质量，同时轻微偏好更小、更平滑的权重。它是需要通过验证集调节的超参数，不是固定公式。

完整的反向传播与更新：

```python
W.grad = None
loss.backward()

with torch.no_grad():
    W -= 50 * W.grad
```

每轮必须先清空梯度，否则 PyTorch 会累加多轮梯度。课程中出现的 `W.data += -50 * W.grad` 能演示更新逻辑，但 `torch.no_grad()` 更安全，不会绕过自动求导机制。

## 10. 两种 Bigram 模型的关系

计数版模型直接使用：

```text
字符对出现次数 -> 按行归一化 -> 概率
```

神经网络版使用：

```text
one-hot -> W -> logits -> softmax -> 概率
```

由于 one-hot 与 `W` 相乘相当于直接选取 `W` 的一行，神经网络版本质上也为每个当前字符保存了 27 个下一字符评分。训练会让这些评分对应的概率逐渐接近数据中的 Bigram 统计规律。

这也是本节最重要的认识：一个看似简单的计数语言模型，可以被重新表述成可用梯度下降训练的神经网络语言模型。

## 11. 今天遇到的易错点

1. `zip(chs, chs[1:])` 是“逐对组合”，并会在较短序列结束时停止。
2. `stoi` 与 `itos` 的键值方向相反，分别服务于计算和展示。
3. `N[i, j]` 的第一个索引是行，代表当前字符；第二个索引是列，代表下一个字符。
4. 行归一化要使用 `sum(dim=1, keepdim=True)`；PyTorch 参数名是 `keepdim`。
5. `p = P[ix]` 中大小写不能写反，否则会覆盖概率矩阵。
6. `Tensor.item()` 把单元素 Tensor 转换为普通 Python 数字。
7. `append()` 原地修改列表，不要把它的返回值重新赋给列表。
8. `F.one_hot(...).float()` 是先生成整数 one-hot，再转换为 `float32`。
9. 每次 `loss.backward()` 前都要把旧梯度清空。
10. 正则化项并不是替代预测损失，而是用系数控制的附加约束。

## 12. 下一步复习建议

1. 不看 Notebook，重新写出 `stoi`、`itos` 和训练对 `xs/ys`。
2. 用一个名字手算 `zip` 生成的所有字符对。
3. 分别打印 `N.shape`、`P.sum(1)` 和 one-hot 的形状。
4. 解释为什么 `xenc @ W` 等价于从 `W` 取一行。
5. 把手写 softmax 换成 `F.softmax`，比较结果。
6. 尝试不同平滑计数和 L2 系数，观察生成结果与损失变化。
7. 将训练数据划分为训练集、验证集和测试集，再比较泛化效果。

参考资料：[karpathy/makemore](https://github.com/karpathy/makemore)（MIT License）。本仓库用于个人学习、复现和中文注释整理，当前进度为 P2。
