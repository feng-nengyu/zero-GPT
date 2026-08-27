# P3 学习笔记：Makemore MLP 字符语言模型

- 日期：2026-08-27
- 课程进度：P3（进行中）
- 参考课程：[Andrej Karpathy — Building makemore Part 2: MLP](https://www.youtube.com/watch?v=TCH_1BHY58I)
- 前置知识：P2 字符级 Bigram（计数模型、神经网络模型、softmax 与 NLL）

> 今天把 Bigram 的“只看前 1 个字符”扩展为 MLP 的“读取前 3 个字符”。核心不只是把代码跑通，而是能随时说清每个 Tensor 的维度含义、矩阵乘法的接口，以及偏置和归一化中的广播方向。

## 1. 今天完成的内容

- 用长度为 3 的滑动窗口构造字符级监督学习数据。
- 建立 `stoi` / `itos` 双向映射，并用 `.` 同时表示空上下文和名字结束。
- 用嵌入表 `C` 把字符编号转换为二维向量。
- 理解 `C[X]` 为什么把 `(N, 3)` 变成 `(N, 3, 2)`。
- 用 `view(-1, 6)` 把 3 个字符的嵌入拼成一个 MLP 输入。
- 搭建 `6 -> 100 -> 27` 的两层 MLP，并核对 3481 个参数。
- 对比手写 softmax/NLL 与 `F.cross_entropy`。
- 完成 minibatch、梯度清零、反向传播和参数更新的训练循环。
- 理解对数尺度学习率搜索 `10**linspace(-3, 0, 1000)`。
- 按 80% / 10% / 10% 划分训练、验证和测试集。
- 排查 Jupyter 中“为什么没有输出 loss”的执行与打印位置问题。

## 2. 先约定维度字母

后续不要只记数字，要先给每个轴起名字：

| 字母 | 含义 | 本次取值 |
|---|---|---:|
| `N` | 全部样本数，会随数据集变化 | 训练集 `182580` |
| `B` | 一次训练使用的 minibatch 大小 | `32` |
| `T` | context/block size，历史字符数 | `3` |
| `E` | 每个字符的 embedding 维度 | `2` |
| `H` | 隐藏层神经元数 | `100` |
| `V` | 词表大小：`.` 加 26 个字母 | `27` |

因此模型主干可以先写成符号形状：

```text
X[B,T] -> C[X][B,T,E] -> flatten[B,T*E]
       -> hidden[B,H] -> logits[B,V]
```

代入今天的数字：

```text
[32,3] -> [32,3,2] -> [32,6] -> [32,100] -> [32,27]
```

这里的 `32` 不是模型结构的一部分，只是当前 minibatch 的样本数；验证整个数据集时，第一维会变成 `22767`。

## 3. 字符映射与特殊 token

```python
chars = sorted(set("".join(words)))
stoi = {char: index + 1 for index, char in enumerate(chars)}
stoi["."] = 0
itos = {index: char for char, index in stoi.items()}
```

- `stoi`：字符转整数，供 Tensor 索引使用。
- `itos`：整数转字符，供调试和展示使用。
- 普通字母使用编号 `1..26`；编号 `0` 留给 `.`。
- `.` 在 context 中充当空位置，在 target 中表示名字结束。

如果原始名字本身可能包含 `.`，就不能直接复用它作为特殊 token；真实项目通常会使用独立的 `<BOS>`、`<EOS>` 或 `<PAD>`。

## 4. 用滑动窗口构造训练数据

```python
def build_dataset(words):
    block_size = 3
    X, Y = [], []

    for word in words:
        context = [0] * block_size
        for char in word + ".":
            index = stoi[char]
            X.append(context)
            Y.append(index)
            context = context[1:] + [index]

    X = torch.tensor(X)
    Y = torch.tensor(Y)
    return X, Y
```

以 `emma` 为例：

```text
... -> e
..e -> m
.em -> m
emm -> a
mma -> .
```

每读到一个字符，就保存一条“当前 3 字符上下文 -> 当前目标字符”的样本，然后让窗口左移一格。

```python
context = context[1:] + [index]
```

这里创建的是一个新列表，所以此前加入 `X` 的 context 不会被后续更新污染。如果改成对同一列表原地修改，就要留意是否需要 `context.copy()`。

Notebook 中完整数据一共有 `228146` 条字符预测样本。固定打乱后，数据集大小为：

| 数据集 | 输入形状 | 目标形状 |
|---|---|---|
| train | `(182580, 3)` | `(182580,)` |
| dev | `(22767, 3)` | `(22767,)` |
| test | `(22799, 3)` | `(22799,)` |

划分代码：

```python
random.seed(42)
random.shuffle(words)

n1 = int(0.8 * len(words))
n2 = int(0.9 * len(words))

Xtr, Ytr = build_dataset(words[:n1])
Xdev, Ydev = build_dataset(words[n1:n2])
Xte, Yte = build_dataset(words[n2:])
```

必须先打乱再切分，否则如果源数据带有排序规律，三个集合的分布可能不同。随机种子让这次划分可以复现。

## 5. Embedding lookup 为什么增加一维

```python
C = torch.randn((27, 2))
emb = C[X]
```

`C` 是一张查找表：

```text
27 个 token × 每个 token 的 2 个坐标
```

`X` 中每个位置原本只有一个字符编号。`C[X]` 会把每个编号替换为长度为 2 的向量：

```text
X[B,T] -> emb[B,T,E]
[32,3] -> [32,3,2]
```

对一个样本来说：

```text
[字符1编号, 字符2编号, 字符3编号]
                 |
                 v
[[a1,a2], [b1,b2], [c1,c2]]
```

索引 Tensor 有什么形状，查表结果就保留这些轴，并在最后追加 embedding 轴。

## 6. 今天必须记住：`view(-1, 6)`

隐藏层希望每个样本收到一条长度为 6 的向量，因此要合并 `T` 和 `E`：

```python
emb_flat = emb.view(-1, 6)
```

```text
原来每个样本：[3,2]
拼平后：      [6]

整个 batch：[32,3,2] -> [32,6]
```

其中 `-1` 表示“根据元素总数自动推断这一维”。推荐写成不依赖固定 batch 大小的形式：

```python
emb_flat = emb.reshape(emb.shape[0], -1)
```

`view()` 和 `reshape()` 都不会改变元素值，只改变观察数据的形状。区别是：

- `view()` 通常要求底层内存连续；
- `reshape()` 必要时可以创建副本，因此更稳妥；
- 两者都必须保持元素总数不变。

不要直接执行 `emb @ W1`。此时 `emb` 最后一维是 2，而 `W1` 第一维是 6，矩阵乘法的收缩维不相等：

```text
[32,3,2] @ [6,100]
        2 != 6  -> 报错
```

先拼平后才能相乘：

```text
[32,6] @ [6,100] -> [32,100]
```

## 7. 两层 MLP 与参数量

```python
g = torch.Generator().manual_seed(2147483647)

C = torch.randn((27, 2), generator=g)
W1 = torch.randn((6, 100), generator=g)
b1 = torch.randn(100, generator=g)
W2 = torch.randn((100, 27), generator=g)
b2 = torch.randn(27, generator=g)

parameters = [C, W1, b1, W2, b2]
```

前向传播：

```python
emb = C[X_batch]                              # (B, 3, 2)
h = torch.tanh(emb.view(-1, 6) @ W1 + b1)    # (B, 100)
logits = h @ W2 + b2                         # (B, 27)
```

参数总数：

```text
C:  27 * 2       =   54
W1:  6 * 100     =  600
b1:  100         =  100
W2: 100 * 27     = 2700
b2:  27          =   27
------------------------
总计                 3481
```

可直接检查：

```python
sum(parameter.nelement() for parameter in parameters)
```

## 8. 维度检查与广播策略

今天明确要求：**每次矩阵运算前检查维度，每次加偏置或归一化时检查广播方向。**

### 矩阵乘法检查

```text
(B, 6) @ (6, H) -> (B, H)
(B, H) @ (H, V) -> (B, V)
```

矩阵乘法只消去中间相同的维度，外侧维度保留。

### 偏置广播

```text
(B, H) + (H,) -> (B, H)
(B, V) + (V,) -> (B, V)
```

PyTorch 从最右侧开始对齐维度。`b1[H]` 会被视为对 batch 中每一行重复使用同一组隐藏层偏置。

### softmax 分母广播

```python
counts = logits.exp()                             # (B, V)
denominator = counts.sum(dim=1, keepdim=True)    # (B, 1)
probs = counts / denominator                     # (B, V)
```

```text
(B,V) / (B,1) -> (B,V)
```

`keepdim=True` 保留“每个样本一行”的结构，让一个样本的 27 个分数除以该样本自己的总和。不能只看“代码没报错”，还要确认广播方向符合语义。

### 建议保留的断言

```python
assert X_batch.ndim == 2
assert X_batch.shape[1] == 3
assert emb.shape == (X_batch.shape[0], 3, 2)
assert emb.shape[1] * emb.shape[2] == W1.shape[0]
assert W1.shape[1] == b1.shape[0]
assert W1.shape[1] == W2.shape[0]
assert W2.shape[1] == b2.shape[0]
```

## 9. 从 logits 到交叉熵

手写版本：

```python
counts = logits.exp()
probs = counts / counts.sum(dim=1, keepdim=True)
loss = -probs[torch.arange(B), Y_batch].log().mean()
```

`probs[torch.arange(B), Y_batch]` 同时提供行号和每行正确标签的列号，因此会从每个样本的 27 个概率中取出正确字符的概率。

实际训练直接使用：

```python
loss = F.cross_entropy(logits, Y_batch)
```

`F.cross_entropy` 直接接收 logits，不要提前做 softmax。它内部组合了稳定的 `log_softmax` 和 NLL，能减少 `exp()` 溢出或下溢的风险。

## 10. Minibatch 训练循环

```python
for step in range(10000):
    ix = torch.randint(0, Xtr.shape[0], (32,))

    emb = C[Xtr[ix]]
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Ytr[ix])

    for parameter in parameters:
        parameter.grad = None
    loss.backward()

    learning_rate = 0.1
    with torch.no_grad():
        for parameter in parameters:
            parameter -= learning_rate * parameter.grad

    if step % 1000 == 0:
        print(step, loss.item())
```

训练顺序必须保持：

```text
抽 minibatch -> forward -> loss -> 清梯度
             -> backward -> 更新参数 -> 下一轮
```

关键细节：

1. `ix` 的形状是 `(32,)`，所以 `Xtr[ix]` 是 `(32,3)`，`Ytr[ix]` 是 `(32,)`。
2. 每次 `backward()` 前必须把旧梯度清空，否则梯度会跨轮累加。
3. 课程中的 `parameter.data += -lr * parameter.grad` 能运行，但 `torch.no_grad()` 更明确、更安全。
4. minibatch loss 会随机波动；不要拿最后一个 batch 的 loss 直接代表整个数据集。

## 11. 学习率指数搜索

```python
lre = torch.linspace(-3, 0, 1000)
lrs = 10**lre
```

- `lre` 是 learning-rate exponents：从 `-3` 到 `0` 均匀取 1000 个指数。
- `lrs` 是实际学习率：从 `10^-3 = 0.001` 到 `10^0 = 1`。
- 学习率不是在线性尺度上均匀变化，而是在数量级上均匀搜索。

等价写法：

```python
lrs = torch.logspace(-3, 0, 1000)
```

实验时记录指数和损失：

```python
lri.append(lre[step].item())
lossi.append(loss.item())
```

再画 `lri` 对 `lossi`，寻找 loss 快速下降但尚未发散的学习率区间。找到范围后，正式训练应使用固定学习率或设计衰减策略，而不是永久从 0.001 扫到 1。

## 12. 为什么当时没有输出 loss

原训练代码中：

```python
# print(loss.item())
```

循环内部的输出被注释，而真正的：

```python
print(loss.item())
```

位于循环外，所以必须等全部训练步结束才输出一次。还有一个 Jupyter 细节：运行 `range(100000)` 后，即使在编辑器里把它改成 `range(100)`，已经提交给内核的那次执行仍会继续跑原来的 100000 次；必须先 Interrupt，再重新运行。

排查顺序：

1. 在循环前加入 `print("start")`；
2. 用 `if step % 1000 == 0:` 定期打印；
3. 看内核是否仍显示 Busy；
4. 必要时 Interrupt Kernel；
5. 仍卡住时 Restart Kernel and Run All。

## 13. 今天的实验结果怎样读

Notebook 当前记录：

```text
最后一个 minibatch loss：2.3024
训练集整体 loss：       2.4105
验证集整体 loss：       2.4184
```

最后一个 minibatch 是随机抽取的 32 条样本，不应直接和全量 train/dev loss 横向比较。全量训练集与验证集 loss 很接近，当前没有明显的严重过拟合信号；但只运行一组配置还不能完成超参数结论，后续仍要记录不同隐藏层大小、embedding 维度和学习率下的 train/dev loss。

测试集应留到模型结构和超参数确定后再评估，不能反复根据测试集结果调参，否则测试集也会被间接“训练”。

## 14. Notebook 中需要继续修正的细节

1. 全量训练或验证时，注释中的 `(32,3,2)`、`(32,100)`、`(32,27)` 已不准确；第一维应写成通用的 `B` 或实际数据集大小。
2. 训练循环中若取消手写 loss 的注释，标签应使用 `Ytr[ix]`，不能使用全量 `Y`。
3. PyTorch 官方参数名优先写 `keepdim=True`；不要依赖其他库常见的 `keepdims` 拼法。
4. `F.cross_entropy(logits, target)` 前不要再调用 softmax。
5. Python 没有 `/* ... */` 式真正的块注释。三引号包裹的是未使用的多行字符串，只适合临时屏蔽代码；正式注释仍建议使用编辑器的 `Ctrl + /`。

## 15. 一眼检查清单

每次写新的网络层，先问自己：

- [ ] 当前 Tensor 每个轴的语义是什么？
- [ ] 矩阵乘法的两个中间维是否相等？
- [ ] `view/reshape` 前后元素总数是否一致？
- [ ] 加法或除法是否触发广播？广播方向符合语义吗？
- [ ] target 是否和当前 batch 使用同一组索引？
- [ ] `backward()` 前是否清空梯度？
- [ ] 参数更新是否放在 `torch.no_grad()` 中？
- [ ] 打印的是 minibatch loss、全量 train loss，还是 dev loss？
- [ ] 随机种子、数据划分和实验配置是否记录？

## 16. 复习时的自测题

1. 为什么 `C[X]` 会比 `X` 多一维？
2. 为什么 `emb @ W1` 报错，而 `emb.view(-1, 6) @ W1` 可以运行？
3. `-1` 在 `view(-1, 6)` 中是怎样推断出来的？
4. `(32,100) + (100,)` 是怎样广播的？
5. 为什么 softmax 要对 `dim=1` 求和，并保留 `(B,1)`？
6. 为什么 `Y` 通常是 `(B,)`，而不是 `(B,1)`？
7. 为什么最后一个 minibatch loss 不能代表整个训练集？
8. train loss 明显降低、dev loss 上升说明什么？
9. 为什么学习率搜索要按 `0.001 -> 0.01 -> 0.1 -> 1` 的数量级进行？
10. 为什么改了正在运行的 Jupyter 单元格，不会改变已经提交的循环？

## 17. 下一步

1. 把所有固定数字 shape 注释改成 `B/T/E/H/V` 语义注释。
2. 封装 `evaluate(X, Y)`，统一计算全量 train/dev/test loss。
3. 正式跑一轮 learning-rate finder，并保存 loss 曲线。
4. 对比至少三组配置：embedding 维度、隐藏层宽度、学习率。
5. 观察 train/dev gap，判断欠拟合、合适拟合或过拟合。
6. 最终再使用 test 集做一次无偏评估。

参考资料：[karpathy/nn-zero-to-hero](https://github.com/karpathy/nn-zero-to-hero) 与 [karpathy/makemore](https://github.com/karpathy/makemore)。本仓库用于个人学习复现和中文细节整理。
