"""Lecture 1: scalar autograd and a tiny MLP, written for learning.

The implementation follows the ideas in Andrej Karpathy's micrograd while
keeping the tanh-based network used in the accompanying learning notebook.
"""

import math
import random


class Value:
    """A scalar value plus the information needed for automatic gradients."""

    def __init__(self, data, _children=(), _op="", label=""):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op
        self.label = label

    def __repr__(self):
        return f"Value(data={self.data:.6f}, grad={self.grad:.6f})"

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), "+")

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), "*")

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __pow__(self, other):
        assert isinstance(other, (int, float)), "power must be int or float"
        out = Value(self.data**other, (self,), f"**{other}")

        def _backward():
            self.grad += other * self.data ** (other - 1) * out.grad

        out._backward = _backward
        return out

    def __neg__(self):
        return self * -1

    def __radd__(self, other):
        return self + other

    def __sub__(self, other):
        return self + (-other)

    def __rsub__(self, other):
        return other + (-self)

    def __rmul__(self, other):
        return self * other

    def __truediv__(self, other):
        return self * other**-1

    def __rtruediv__(self, other):
        return other * self**-1

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), "tanh")

        def _backward():
            self.grad += (1 - t**2) * out.grad

        out._backward = _backward
        return out

    def exp(self):
        out = Value(math.exp(self.data), (self,), "exp")

        def _backward():
            self.grad += out.data * out.grad

        out._backward = _backward
        return out

    def backward(self):
        topo = []
        visited = set()

        def build_topo(node):
            if node not in visited:
                visited.add(node)
                for child in node._prev:
                    build_topo(child)
                topo.append(node)

        build_topo(self)
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()


def trace(root):
    """Return all Value nodes and directed edges reachable from root."""
    nodes, edges = set(), set()

    def build(node):
        if node not in nodes:
            nodes.add(node)
            for child in node._prev:
                edges.add((child, node))
                build(child)

    build(root)
    return nodes, edges


def draw_dot(root):
    """Create a left-to-right Graphviz view of a Value computation graph."""
    from graphviz import Digraph

    dot = Digraph(format="svg", graph_attr={"rankdir": "LR"})
    nodes, edges = trace(root)

    for node in nodes:
        uid = str(id(node))
        dot.node(
            name=uid,
            label="{ %s | data %.4f | grad %.4f }"
            % (node.label, node.data, node.grad),
            shape="record",
        )
        if node._op:
            dot.node(name=uid + node._op, label=node._op)
            dot.edge(uid + node._op, uid)

    for parent, child in edges:
        dot.edge(str(id(parent)), str(id(child)) + child._op)

    return dot


class Module:
    def zero_grad(self):
        for parameter in self.parameters():
            parameter.grad = 0.0

    def parameters(self):
        return []


class Neuron(Module):
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))

    def __call__(self, x):
        assert len(x) == len(self.w), (
            f"expected {len(self.w)} inputs, received {len(x)}"
        )
        activation = sum((weight * value for weight, value in zip(self.w, x)), self.b)
        return activation.tanh()

    def parameters(self):
        return self.w + [self.b]


class Layer(Module):
    def __init__(self, nin, nout):
        self.neurons = [Neuron(nin) for _ in range(nout)]

    def __call__(self, x):
        outputs = [neuron(x) for neuron in self.neurons]
        return outputs[0] if len(outputs) == 1 else outputs

    def parameters(self):
        return [parameter for neuron in self.neurons for parameter in neuron.parameters()]


class MLP(Module):
    def __init__(self, nin, nouts):
        sizes = [nin] + nouts
        self.layers = [
            Layer(sizes[index], sizes[index + 1])
            for index in range(len(nouts))
        ]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [
            parameter
            for layer in self.layers
            for parameter in layer.parameters()
        ]


def train_demo(steps=40, learning_rate=0.05, seed=42):
    """Train the lecture's 3-4-4-1 MLP on four tiny examples."""
    random.seed(seed)
    model = MLP(3, [4, 4, 1])
    xs = [
        [2.0, 3.0, -1.0],
        [3.0, -1.0, 0.5],
        [0.5, 1.0, 1.0],
        [1.0, 1.0, -1.0],
    ]
    ys = [1.0, -1.0, -1.0, 1.0]
    losses = []

    for step in range(steps):
        predictions = [model(x) for x in xs]
        loss = sum((prediction - target) ** 2 for target, prediction in zip(ys, predictions))

        model.zero_grad()
        loss.backward()

        for parameter in model.parameters():
            parameter.data -= learning_rate * parameter.grad

        losses.append(loss.data)
        if step == 0 or (step + 1) % 10 == 0:
            print(f"step={step:02d} loss={loss.data:.6f}")

    return model, losses


def torch_reference():
    """Compare one scalar neuron with PyTorch's autograd in float64."""
    import torch

    x1 = torch.tensor([2.0], dtype=torch.float64, requires_grad=True)
    x2 = torch.tensor([0.0], dtype=torch.float64, requires_grad=True)
    w1 = torch.tensor([-3.0], dtype=torch.float64, requires_grad=True)
    w2 = torch.tensor([1.0], dtype=torch.float64, requires_grad=True)
    b = torch.tensor([6.8813735870195432], dtype=torch.float64, requires_grad=True)

    output = torch.tanh(x1 * w1 + x2 * w2 + b)
    output.backward()
    return {
        "output": output.item(),
        "x1.grad": x1.grad.item(),
        "x2.grad": x2.grad.item(),
        "w1.grad": w1.grad.item(),
        "w2.grad": w2.grad.item(),
        "b.grad": b.grad.item(),
    }


if __name__ == "__main__":
    _, training_losses = train_demo()
    assert training_losses[-1] < training_losses[0]
    print(torch_reference())
