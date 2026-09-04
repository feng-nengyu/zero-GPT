"""Measure tanh activation and gradient statistics across initialization scales.

This is an assessment instrument, not a worked solution. Run it, inspect the
numbers, and explain the pattern before changing the mastery status.
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass

import torch
import torch.nn.functional as F


@dataclass(frozen=True)
class LayerStats:
    scale: float
    layer: int
    activation_mean: float
    activation_std: float
    saturation_pct: float
    local_derivative_mean: float
    preactivation_grad_std: float
    gradient_retention: float


def collect_stats(
    scale: float,
    *,
    depth: int,
    width: int,
    batch_size: int,
    seed: int,
) -> tuple[float, list[LayerStats]]:
    generator = torch.Generator().manual_seed(seed)
    hidden = torch.randn(batch_size, width, generator=generator)
    preactivations: list[torch.Tensor] = []
    activations: list[torch.Tensor] = []

    for _ in range(depth):
        weight = (
            torch.randn(width, width, generator=generator)
            * scale
            / math.sqrt(width)
        ).requires_grad_()
        preactivation = hidden @ weight
        hidden = torch.tanh(preactivation)
        preactivation.retain_grad()
        hidden.retain_grad()
        preactivations.append(preactivation)
        activations.append(hidden)

    target = torch.randn(batch_size, width, generator=generator)
    loss = F.mse_loss(hidden, target)
    loss.backward()

    rows = []
    with torch.no_grad():
        for layer, (activation, preactivation) in enumerate(
            zip(activations, preactivations, strict=True), start=1
        ):
            if preactivation.grad is None or activation.grad is None:
                raise RuntimeError(f"Missing retained gradient at layer {layer}")
            activation_grad_norm = activation.grad.norm().item()
            gradient_retention = (
                preactivation.grad.norm().item() / activation_grad_norm
                if activation_grad_norm
                else float("nan")
            )
            rows.append(
                LayerStats(
                    scale=scale,
                    layer=layer,
                    activation_mean=activation.mean().item(),
                    activation_std=activation.std().item(),
                    saturation_pct=(activation.abs() > 0.99).float().mean().item()
                    * 100,
                    local_derivative_mean=(1 - activation.square()).mean().item(),
                    preactivation_grad_std=preactivation.grad.std().item(),
                    gradient_retention=gradient_retention,
                )
            )

    return loss.item(), rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scales", nargs="+", type=float, default=[1.0, 3.0, 5.0])
    parser.add_argument("--depth", type=int, default=8)
    parser.add_argument("--width", type=int, default=128)
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--seed", type=int, default=2147483647)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.depth < 1 or args.width < 1 or args.batch_size < 1:
        raise ValueError("depth, width, and batch-size must all be positive")
    if any(scale <= 0 for scale in args.scales):
        raise ValueError("all initialization scales must be positive")

    print(
        "| scale | layer | activation mean | activation std | "
        "|activation| > 0.99 | mean tanh derivative | "
        "preactivation grad std | gradient retention |"
    )
    print("|---:|---:|---:|---:|---:|---:|---:|---:|")

    losses = []
    for scale in args.scales:
        loss, rows = collect_stats(
            scale,
            depth=args.depth,
            width=args.width,
            batch_size=args.batch_size,
            seed=args.seed,
        )
        losses.append((scale, loss))
        for row in rows:
            print(
                f"| {row.scale:.2f} | {row.layer} | {row.activation_mean:.3e} | "
                f"{row.activation_std:.3e} | {row.saturation_pct:.2f}% | "
                f"{row.local_derivative_mean:.3e} | "
                f"{row.preactivation_grad_std:.3e} | "
                f"{row.gradient_retention:.3e} |"
            )

    print("\nLoss check:")
    for scale, loss in losses:
        print(f"- scale={scale:.2f}: loss={loss:.6f}")


if __name__ == "__main__":
    main()
