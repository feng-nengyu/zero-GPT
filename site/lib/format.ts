const statusMap: Record<string, string> = {
  planned: "计划中",
  "in-progress": "进行中",
  learning: "已学习",
  checking: "待验证",
  mastered: "已掌握",
  published: "已发布",
  done: "已完成",
  carried: "已顺延",
};

export function statusLabel(status: string): string {
  return statusMap[status] || status;
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year}.${month}.${day}`;
}
